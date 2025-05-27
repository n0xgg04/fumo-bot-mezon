import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageButtonClickedEvent, TokenSentEventI } from './types';
import {
  ChannelMessage,
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
} from 'mezon-sdk';
import { getGameRef, getRef } from 'src/common/utils/get-ref';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import {
  EKeobuabaoGameStatus,
  ETransactionType,
  KeoBuaBaoEnum,
} from '@prisma/client';
import { MezonService } from 'src/v2/mezon/mezon.service';
import { TokenSentEvent } from 'mezon-sdk';

const CHOICES = {
  bua: KeoBuaBaoEnum.BUA,
  keo: KeoBuaBaoEnum.KEO,
  bao: KeoBuaBaoEnum.BAO,
};

const CHOICES_SUB = {
  bua: '👊BÚA',
  keo: '✂️KÉO',
  bao: '👋BAO',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class TopupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mezon: MezonService,
  ) {}

  async createToken(data: TokenSentEvent & { transaction_id: string }) {
    const transactionId = data.transaction_id;
    try {
      const check = await this.prisma.transaction_logs.findFirst({
        where: {
          transaction_id: transactionId,
        },
      });
      if (check || !data.sender_id) return;
      await Promise.all([
        this.prisma.$transaction(async (tx) => {
          const userBalance = await tx.user_balance.findUnique({
            where: {
              user_id: data.sender_id,
            },
          });
          if (!userBalance) {
            await tx.user_balance.create({
              data: {
                user_id: data.sender_id!,
                balance: data.amount,
                username: data.sender_name!,
              },
            });
            await tx.transaction_logs.create({
              data: {
                transaction_id: transactionId,
                user_id: data.sender_id!,
                amount: data.amount,
              },
            });
          } else {
            await tx.user_balance.update({
              where: {
                user_id: data.sender_id!,
              },
              data: {
                balance: {
                  increment: data.amount,
                },
              },
            });
            await tx.transaction_logs.create({
              data: {
                transaction_id: transactionId,
                user_id: data.sender_id!,
                amount: data.amount,
              },
            });
          }
        }),
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  async ping(data: ChannelMessage) {
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: data.message_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'normal_text',
          content: 'PONG',
        },
      },
    });
  }

  async checkBalance(data: ChannelMessage) {
    const userBalance = await this.prisma.user_balance.findUnique({
      where: {
        user_id: data.sender_id,
      },
    });
    if (!userBalance) {
      const message = `💸Bạn không có số dư\nHãy nạp thêm token bằng cách send token cho bot FUMO.`;
      await this.mezon.sendMessage({
        type: 'channel',
        reply_to_message_id: data.message_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
    } else {
      const message = `💸Số dư của bạn là ${userBalance.balance} token`;
      await this.mezon.sendMessage({
        type: 'channel',
        reply_to_message_id: data.message_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
    }
  }

  async withdraw(data: ChannelMessage, amount: number) {
    const userBalance = await this.prisma.user_balance.findUnique({
      where: {
        user_id: data.sender_id,
      },
    });
    if (!userBalance || userBalance.balance < amount || amount < 1000) {
      const message = `💸Số dư của bạn không đủ để rút hoặc số tiền rút không hợp lệ`;
      await this.mezon.sendMessage({
        type: 'channel',
        reply_to_message_id: data.message_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
    } else {
      //check
      const fumoSent = await this.prisma.transaction_send_logs.findMany({
        where: {
          user_id: 'fumo',
          to_user_id: data.sender_id,
          created_at: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          note: {
            startsWith: 'lot_',
          },
        },
      });

      if (fumoSent.length != 0) {
        const message = `Bạn vừa thắng giải Lot, Fumo cần xác thực lại số tiền thắng\nVui lòng chờ 24h để rút lại`;
        await this.mezon.sendMessage({
          type: 'channel',
          reply_to_message_id: data.message_id,
          payload: {
            channel_id: data.channel_id,
            message: {
              type: 'system',
              content: message,
            },
          },
        });
      } else {
        await this.prisma.$transaction(async (tx) => {
          await tx.user_balance.update({
            where: {
              user_id: data.sender_id,
            },
            data: {
              balance: {
                decrement: amount,
              },
            },
          });
          await tx.transaction_logs.create({
            data: {
              user_id: data.sender_id,
              amount: amount,
              type: ETransactionType.WITHDRAW,
            },
          });
        });
        await this.mezon.sendToken({
          user_id: data.sender_id,
          amount: amount,
          note: `Rút ${amount} token`,
        });
        const message = `💸Rút ${amount} token thành công`;
        await this.mezon.sendMessage({
          type: 'channel',
          reply_to_message_id: data.message_id,
          payload: {
            channel_id: data.channel_id,
            message: {
              type: 'system',
              content: message,
            },
          },
        });
      }
    }
  }

  async createKBB(data: ChannelMessage, amount: number) {
    const ref = getRef(data);
    let partnerId: string | undefined;
    let parterName: string | undefined;
    if (data.content.t?.includes('@')) {
      const mention = data.mentions?.[0];
      if (mention) {
        const m = data.content.t.split(' ');
        partnerId = mention.user_id;
        parterName = m[1].slice(1);
        amount = Number(m[2]);
        if (isNaN(amount)) return;
      }
    } else {
      partnerId = data.references?.[0]?.message_sender_id;
      parterName = data.references?.[0]?.message_sender_username;
    }
    const m = `🔃Đang thiết lập game...`;
    const promiseMessage = await this.mezon.sendMessage({
      reply_to_message_id: data.message_id,
      type: 'channel',
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: m,
        },
      },
    });
    if (!promiseMessage) return;

    await delay(1000);
    if (amount < 0 || amount > 1000000 || isNaN(amount)) {
      const message = `😅Số tiền không hợp lệ\nSố tiền phải lớn hơn 0 và nhỏ hơn 1.000.000`;
      await this.mezon.updateMessage({
        channel_id: promiseMessage.channel_id,
        message_id: promiseMessage.message_id,
        content: {
          type: 'system',
          content: message,
        },
      });
      return;
    }

    if (!partnerId) {
      const message = `😅Bạn không có đối thủ. Hãy rep tin nhắn ai đó`;
      await this.mezon.updateMessage({
        channel_id: promiseMessage.channel_id,
        message_id: promiseMessage.message_id,
        content: {
          type: 'system',
          content: message,
        },
      });
      return;
    }

    const partnerBalance = await this.prisma.user_balance.findUnique({
      where: {
        user_id: partnerId,
      },
    });

    let pBalance: any;
    if (!partnerBalance) {
      pBalance = await this.prisma.user_balance.create({
        data: {
          user_id: partnerId,
          balance: 0,
          username: parterName!,
        },
      });
    } else {
      pBalance = partnerBalance;
    }

    if (pBalance.balance < amount) {
      const message = `😅Đối thủ không có đủ tiền để chơi`;
      await this.mezon.updateMessage({
        channel_id: promiseMessage.channel_id,
        message_id: promiseMessage.message_id,
        content: {
          type: 'system',
          content: message,
        },
      });
      return;
    }

    const myBalance = await this.prisma.user_balance.findUnique({
      where: {
        user_id: data.sender_id,
      },
    });
    let mBalance: any;
    if (!myBalance) {
      mBalance = await this.prisma.user_balance.create({
        data: {
          user_id: data.sender_id,
          balance: 0,
          username: data.username!,
        },
      });
    } else {
      mBalance = myBalance;
    }

    if (mBalance.balance < amount) {
      const message = `😅Bạn không có đủ tiền để chơi`;
      await this.mezon.updateMessage({
        channel_id: promiseMessage.channel_id,
        message_id: promiseMessage.message_id,
        content: {
          type: 'system',
          content: message,
        },
      });
      return;
    }

    await Promise.all([
      this.mezon.updateMessage({
        channel_id: promiseMessage.channel_id,
        message_id: promiseMessage.message_id,
        content: {
          type: 'optional',
          content: {
            t: `🎮Kéo búa bao giữa ${data.username} và ${data.references?.[0]?.message_sender_username}\n💰Cược ${amount} token`,
            components: [
              {
                components: [
                  {
                    id: 'keo',
                    type: EMessageComponentType.BUTTON,
                    component: {
                      label: '✂️KÉO',
                      style: EButtonMessageStyle.SUCCESS,
                    },
                  },
                  {
                    id: 'bua',
                    type: EMessageComponentType.BUTTON,
                    component: {
                      label: '👊BÚA',
                      style: EButtonMessageStyle.SECONDARY,
                    },
                  },
                  {
                    id: 'bao',
                    type: EMessageComponentType.BUTTON,
                    component: {
                      label: '👋BAO',
                      style: EButtonMessageStyle.PRIMARY,
                    },
                  },
                  {
                    id: 'che',
                    type: EMessageComponentType.BUTTON,
                    component: {
                      label: '❌TỪ CHỐI CHƠI',
                      style: EButtonMessageStyle.DANGER,
                    },
                  },
                ],
              },
            ],
          },
        },
      }),
      this.prisma.keobuabao_game.create({
        data: {
          status: EKeobuabaoGameStatus.PLAYING,
          user_id_create: data.sender_id,
          cost: amount,
          only_for_user_id: partnerId,
          channel_id: promiseMessage.channel_id,
          message_id: promiseMessage.message_id,
          clan_id: data.clan_id!,
          is_public_channel: data.is_public || false,
          user_name_create: data.username!,
          only_for_user_name: data.references?.[0]?.message_sender_username,
          mode: String(data.mode || EMessageMode.CHANNEL_MESSAGE),
        },
      }),
    ]);
  }

  async checkWin(
    myChoice: KeoBuaBaoEnum,
    partnerChoice: KeoBuaBaoEnum,
  ): Promise<-1 | 0 | 1> {
    if (myChoice === partnerChoice) {
      return -1;
    }

    if (
      (myChoice === KeoBuaBaoEnum.KEO && partnerChoice === KeoBuaBaoEnum.BUA) || // Kéo thắng Búa
      (myChoice === KeoBuaBaoEnum.BUA && partnerChoice === KeoBuaBaoEnum.BAO) || // Búa thắng Bao
      (myChoice === KeoBuaBaoEnum.BAO && partnerChoice === KeoBuaBaoEnum.KEO) // Bao thắng Kéo
    ) {
      return 1;
    }

    return 0;
  }

  async handleMessageButtonClicked(data: MessageButtonClickedEvent) {
    const game = await this.prisma.keobuabao_game.findMany({
      where: {
        channel_id: data.channel_id,
        message_id: data.message_id,
        OR: [
          {
            user_id_create: data.user_id,
          },
          {
            only_for_user_id: data.user_id,
          },
        ],
        status: EKeobuabaoGameStatus.PLAYING,
      },
      take: 1,
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!game || game.length === 0) {
      // Game không tồn tại
      return;
    } else {
      if (data.button_id === 'che') {
        const m = '(Game đã kết thúc do từ chối chơi)';
        await Promise.all([
          this.mezon.updateMessage({
            clan_id: game[0].clan_id,
            channel_id: game[0].channel_id,
            message_id: game[0].message_id,
            content: {
              type: 'system',
              content: m,
            },
          }),
          this.prisma.keobuabao_game.update({
            where: {
              id: game[0].id,
            },
            data: {
              status: EKeobuabaoGameStatus.ENDED,
            },
          }),
        ]);
        return;
      }
      const check = await this.prisma.keobuabao_game_logs.findFirst({
        where: {
          user_id: data.user_id,
          game_id: game[0].id,
        },
      });
      if (check) {
        const mess = '❌Bạn đã chọn rồi';
        await this.mezon.sendMessage({
          reply_to_message_id: data.message_id,
          type: 'channel',
          clan_id: game[0].clan_id,
          payload: {
            channel_id: game[0].channel_id,
            message: {
              type: 'system',
              content: mess,
            },
          },
        });
      } else {
        const userBalance = await this.prisma.user_balance.findUnique({
          where: {
            user_id: data.user_id,
          },
        });

        if (userBalance && userBalance.balance < game[0].cost) {
          const mess = `💸Bạn (${userBalance?.username}) không có đủ tiền để chơi`;
          await this.mezon.sendMessage({
            type: 'channel',
            reply_to_message_id: data.message_id,
            clan_id: game[0].clan_id,
            payload: {
              channel_id: game[0].channel_id,
              message: {
                type: 'system',
                content: mess,
              },
            },
          });
          return;
        }

        //!
        const partnerChosen = await this.prisma.keobuabao_game_logs.findFirst({
          where: {
            game_id: game[0].id,
            user_id: {
              not: data.user_id,
            },
          },
        });
        if (partnerChosen) {
          //parnerBalance
          const partnerBalance = await this.prisma.user_balance.findUnique({
            where: {
              user_id: partnerChosen.user_id,
            },
          });
          if (partnerBalance && partnerBalance.balance < game[0].cost) {
            const mess = `🚫Ván bị huỷ do người chơi ${partnerBalance?.username} không có khả năng chi trả.`;
            await this.mezon.sendMessage({
              type: 'channel',
              clan_id: game[0].clan_id,
              payload: {
                channel_id: game[0].channel_id,
                message: {
                  type: 'system',
                  content: mess,
                },
              },
            });
            return;
          }
          const myChoice = CHOICES[data.button_id] as KeoBuaBaoEnum;
          const result = await this.checkWin(
            myChoice,
            partnerChosen.keo_bua_bao,
          );
          if (result === -1) {
            const mess = `😲Bạn và đối thủ đều chọn ${CHOICES_SUB[data.button_id]}\nVán này hoà!`;
            await this.mezon.sendMessage({
              reply_to_message_id: game[0].message_id,
              type: 'channel',
              clan_id: game[0].clan_id,
              payload: {
                channel_id: game[0].channel_id,
                message: {
                  type: 'system',
                  content: mess,
                },
              },
            });
          } else {
            const [userCredit, partnerCredit] = await Promise.all([
              this.prisma.user_balance.findFirst({
                where: {
                  user_id: data.user_id,
                },
              }),
              this.prisma.user_balance.findFirst({
                where: {
                  user_id: partnerChosen.user_id,
                },
              }),
            ]);
            if (result === 0) {
              await this.prisma.$transaction(async (tx) => {
                const m1 = `📣KẾT QUẢ\n${userCredit?.username} ra ${CHOICES_SUB[data.button_id]}\n${partnerCredit?.username} ra ${CHOICES_SUB[partnerChosen.keo_bua_bao.toLowerCase()]} \n 🏆KẾT QUẢ: ${userCredit?.username} nhận ${game[0].cost} token từ ${partnerCredit?.username}`;
                await Promise.all([
                  this.mezon.sendMessage({
                    reply_to_message_id: game[0].message_id,
                    type: 'channel',
                    clan_id: game[0].clan_id,
                    payload: {
                      channel_id: game[0].channel_id,
                      message: {
                        type: 'system',
                        content: m1,
                      },
                    },
                  }),
                  tx.user_balance.update({
                    where: {
                      user_id: data.user_id,
                    },
                    data: {
                      balance: { increment: game[0].cost },
                    },
                  }),
                  tx.user_balance.update({
                    where: {
                      user_id: partnerChosen.user_id,
                    },
                    data: {
                      balance: { decrement: game[0].cost },
                    },
                  }),
                  tx.keobuabao_game.update({
                    where: {
                      id: game[0].id,
                    },
                    data: {
                      status: EKeobuabaoGameStatus.ENDED,
                    },
                  }),
                  tx.transaction_send_logs.createMany({
                    data: [
                      {
                        user_id: data.user_id,
                        to_user_id: partnerChosen.user_id,
                        amount: game[0].cost,
                        note: 'win_kbb',
                      },
                      {
                        user_id: partnerChosen.user_id,
                        to_user_id: data.user_id,
                        amount: game[0].cost,
                        note: 'lose_kbb',
                      },
                    ],
                  }),
                ]);
              });
            } else {
              const mess = `📣KẾT QUẢ\n${userCredit?.username} ra ${CHOICES_SUB[data.button_id]} \n${partnerCredit?.username} ra ${CHOICES_SUB[partnerChosen.keo_bua_bao.toLowerCase()]} \n 🏆KẾT QUẢ: ${partnerCredit?.username} nhận ${game[0].cost} token từ ${userCredit?.username}`;
              await Promise.all([
                this.mezon.sendMessage({
                  reply_to_message_id: game[0].message_id,
                  type: 'channel',
                  clan_id: game[0].clan_id,
                  payload: {
                    channel_id: game[0].channel_id,
                    message: {
                      type: 'system',
                      content: mess,
                    },
                  },
                }),
                this.prisma.$transaction(async (tx) => {
                  await Promise.all([
                    tx.user_balance.update({
                      where: {
                        user_id: data.user_id,
                      },
                      data: {
                        balance: { decrement: game[0].cost },
                      },
                    }),
                    tx.user_balance.update({
                      where: {
                        user_id: partnerChosen.user_id,
                      },
                      data: {
                        balance: { increment: game[0].cost },
                      },
                    }),
                    tx.keobuabao_game.update({
                      where: {
                        id: game[0].id,
                      },
                      data: {
                        status: EKeobuabaoGameStatus.ENDED,
                      },
                    }),
                    tx.transaction_send_logs.createMany({
                      data: [
                        {
                          user_id: data.user_id,
                          to_user_id: partnerChosen.user_id,
                          amount: game[0].cost,
                          note: 'win_kbb',
                        },
                        {
                          user_id: partnerChosen.user_id,
                          to_user_id: data.user_id,
                          amount: game[0].cost,
                          note: 'lose_kbb',
                        },
                      ],
                    }),
                  ]);
                }),
              ]);
            }
          }
          const m = '(Game đã kết thúc)';
          await this.mezon.updateMessage({
            clan_id: game[0].clan_id,
            channel_id: game[0].channel_id,
            message_id: game[0].message_id,
            content: {
              type: 'system',
              content: m,
            },
          });
        } else {
          const userName = await this.prisma.user_balance.findFirst({
            where: {
              user_id: data.user_id,
            },
            select: {
              username: true,
            },
          });
          const messageC = `👏${userName?.username} đã chọn.\n Hãy chờ đối phương chọn!`;

          await Promise.all([
            this.prisma.keobuabao_game_logs.create({
              data: {
                game_id: game[0].id,
                user_id: data.user_id,
                keo_bua_bao: CHOICES[data.button_id],
              },
            }),
            this.mezon.sendMessage({
              reply_to_message_id: data.message_id,
              type: 'channel',
              clan_id: game[0].clan_id,
              payload: {
                channel_id: game[0].channel_id,
                message: {
                  type: 'system',
                  content: messageC,
                },
              },
            }),
          ]);
        }
      }
    }
  }
}
