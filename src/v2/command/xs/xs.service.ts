import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  ChannelMessage,
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
} from 'mezon-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { XsResponse } from './types/xs';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { random } from 'lodash';
import { formatToken } from 'src/common/utils/formater';
import { MezonService } from 'src/v2/mezon/mezon.service';
import { UserService } from 'src/v2/user/user-service';
import { MessageButtonClicked } from 'mezon-sdk/dist/cjs/rtapi/realtime';

interface TopPlayer {
  user_id: string;
  username: string;
  win_count: number;
}

@Injectable()
export class XsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mezon: MezonService,
    private readonly userService: UserService,
  ) {}

  private xsCost = 5000;
  private lotCost = 5000;

  async topServer(data: ChannelMessage) {
    const placeholder = await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: 'Đang lấy danh sách top 10 nạp nhiều nhất server...',
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const topPlayers = await this.prisma.transaction_logs.groupBy({
      by: ['user_id'],
      where: {
        type: 'DEPOSIT',
        user_id: {
          not: '1840678620591296512',
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 10,
    });

    if (topPlayers.length === 0) {
      await this.mezon.updateMessage({
        clan_id: data.clan_id!,
        channel_id: data.channel_id,
        message_id: placeholder.message_id,
        content: {
          type: 'system',
          content: '🏆 TOP 10 NGƯỜI NẠP NHIỀU NHẤT SERVER\nChưa có dữ liệu',
        },
      });
      return;
    }

    const userIds = topPlayers.map((player) => player.user_id);
    const users = await this.prisma.user_balance.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.user_id, user.username]));
    const message =
      '🏆 TOP 10 NGƯỜI NẠP NHIỀU NHẤT SERVER\n' +
      topPlayers
        .map((player, index) => {
          const username = userMap.get(player.user_id) || 'Unknown User';
          return `${index + 1}. ${username}: ${formatToken(player._sum.amount)}`;
        })
        .join('\n');

    await this.mezon.updateMessage({
      clan_id: data.clan_id!,
      channel_id: data.channel_id,
      message_id: placeholder.message_id,
      content: {
        type: 'system',
        content: message,
      },
    });
  }

  async topKBB(data: ChannelMessage) {
    const placeholder = await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: 'Đang lấy danh sách top 10 người thắng kéo búa bao...',
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const topPlayers = await this.prisma.transaction_send_logs.groupBy({
      by: ['user_id'],
      where: {
        note: 'win_kbb',
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    if (topPlayers.length === 0) {
      await this.mezon.updateMessage({
        clan_id: data.clan_id!,
        channel_id: data.channel_id,
        message_id: placeholder.message_id,
        content: {
          type: 'system',
          content: '🏆 TOP 10 NGƯỜI THẮNG KÉO BÚA BAO\nChưa có dữ liệu',
        },
      });
    }

    const userIds = topPlayers.map((player) => player.user_id);
    const users = await this.prisma.user_balance.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
      select: {
        user_id: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.user_id, user.username]));
    const message =
      '🏆 TOP 10 NGƯỜI THẮNG KÉO BÚA BAO\n' +
      topPlayers
        .map((player, index) => {
          const username = userMap.get(player.user_id) || 'Unknown User';
          return `${index + 1}. ${username}: ${player._count.id} lần thắng`;
        })
        .join('\n');

    await this.mezon.updateMessage({
      clan_id: data.clan_id!,
      channel_id: data.channel_id,
      message_id: placeholder.message_id,
      content: {
        type: 'system',
        content: message,
      },
    });
  }

  async uoc(data: ChannelMessage) {
    const u = data.content.t?.split(' ').slice(1);
    const message = `${data.username} đã ước ${u?.join(' ')}\n🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏`;
    await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: message,
        },
      },
    });
  }

  async xinSo(data: ChannelMessage) {
    const randomNumber = random(0, 99);
    const message = `🍀 Số của bạn là: ${randomNumber}\nChúc may mắn!`;
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: data.message_id,
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: message,
        },
      },
    });
  }

  async getLotNumbers(data: ChannelMessage) {
    const numbers = await this.prisma.lot_logs.findMany({
      where: {
        is_active: true,
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 10)),
        },
        user_id: data.sender_id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    const message = `🔑 Các con số (LOT) đã chơi lần lượt là: ${numbers.map((number) => number.number).join(', ')}\nHãy cầu nguyện để may mắn đến với bạn!`;
    await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: message,
        },
      },
    });
  }

  async kqxs() {
    const response = await axios.get<XsResponse>(
      'https://api-xsmb-today.onrender.com/api/v1',
    );
    return response.data;
  }

  async theLeLot(data: ChannelMessage) {
    await this.mezon.sendMessage({
      reply_to_message_id: data.message_id,
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: `🎉 THỂ LỆ CHƠI LOT\nMỗi ngày, bạn có thể gieo "may mắn" bằng cách mua số, giá trị mỗi số là 5.000 token, mua tối đa 4 số mỗi ngày. Mỗi số bạn mua sẽ có hạn sử dụng trong vòng 10 ngày kể từ thời điểm bạn mua, sau 10 ngày hoặc khi có người chiến thắng sẽ không còn hiệu lực nữa.\nVào 18:30 ngày ngày, Fumo lấy 2 cặp số dựa trên 4 số đầu của kết quả xổ số miền Bắc ngày hôm đó. Giải thưởng sẽ được trao cho người may mắn sở hữu 2 cặp số (còn hạn sử dụng và 2 số khác nhau) trùng với 2 cặp số may mắn ngày hôm đó. Nếu 2 cặp số may mắn trùng nhau, sẽ không tính kết quả ngày hôm đó. \nNếu không có ai nhận được giải, giải thưởng sẽ được cộng dồn sang ngày hôm sau.\nVí dụ: Ngày thứ nhất, bạn mua 2 cặp số 12 và 56, ngày thứ hai, bạn mua thêm 2 cặp số là 13 và 57. Vào 18:30 ngày thứ 2, kết quả xổ số miền bắc là 1213x hoặc 1312x, bạn sẽ nhận được giải thưởng do có cặp số 12, 13 trúng giải.\nGAME vô cùng minh bạch và được lưu lại toàn bộ giao dịch và sẵn sàng công khai, hãy trao niềm tin, nhận token ngay!`,
        },
      },
    });
  }

  async myNumbers(data: ChannelMessage) {
    const numbers = await this.prisma.xs_logs.findMany({
      where: {
        user_id: data.sender_id,
        is_active: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    if (numbers.length > 0) {
      const m = `🔑 Các con số của bạn đã chơi lần lượt là: ${numbers.map((number) => number.number).join(', ')}. Hãy đón chờ kết quả xổ số ngày hôm nay nhé.`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: m,
          },
        },
      });
    } else {
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: `❌ Bạn chưa chơi xổ số`,
          },
        },
      });
    }
  }

  async getKqxs(data: ChannelMessage) {
    const placeholder = await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: data.message_id,
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: `Đang tra cứu kết quả xổ số...`,
        },
      },
    });
    if (!placeholder) return;
    const response = await this.kqxs();
    const { countNumbers, time, results } = response;
    let message = `🔍Kết quả xổ số ngày ${time}\n`;
    for (const key in results) {
      message += `${key}: ${results[key].join(', ')}\n`;
    }
    await this.mezon.updateMessage({
      clan_id: data.clan_id!,
      channel_id: data.channel_id,
      message_id: placeholder.message_id,
      content: {
        type: 'system',
        content: message,
      },
    });
  }

  async setXS(data: ChannelMessage, cost: number) {
    if (data.username != 'anh.luongtuan') {
      const message = `❌ Bạn không có quyền sử dụng lệnh này`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }
    this.xsCost = cost;

    await this.mezon.sendMessage({
      reply_to_message_id: data.message_id,
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: `Đã thiết lập giá chơi xổ số thành ${cost} token`,
        },
      },
    });
  }

  async giaiThuong(data: ChannelMessage) {
    const balace = await this.prisma.xs_logs.aggregate({
      where: {
        is_active: true,
      },
      _sum: {
        cost: true,
      },
    });
    const message = `💰 Tổng số tiền dành cho người chiến thắng: ${balace._sum.cost || 0} token`;
    await this.mezon.sendMessage({
      reply_to_message_id: data.message_id,
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: message,
        },
      },
    });
  }

  async giaiThuongLot(data: ChannelMessage) {
    const balace = await this.prisma.lot_logs.aggregate({
      where: {
        is_active: true,
      },
      _sum: {
        cost: true,
      },
    });
    const message = `💰 Tổng số tiền dành cho người chiến thắng Lott: ${balace._sum.cost || 0} token`;
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: data.message_id,
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: message,
        },
      },
    });
  }

  async playXS(data: ChannelMessage, numbers: number[]) {
    const user = await this.userService.getUserBalance(data);

    if (numbers.some((num) => num < 0 || num > 99 || isNaN(num))) {
      const message = `❌ Số không hợp lệ\nSố phải lớn hoặc bằng hơn 0 và nhỏ hoặc bằng 99`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    const totalCost = numbers.length * this.xsCost;

    if (!user || user?.balance < totalCost) {
      const message = `❌ Bạn không có đủ ${totalCost} token để chơi ${numbers.length} số xổ số`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    const countMe = await this.prisma.xs_logs.findMany({
      where: {
        user_id: data.sender_id,
        is_active: true,
      },
    });

    if (countMe.length + numbers.length > 15) {
      const message = `❌ Bạn đã chơi xổ số quá nhiều lần`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    const checkExist = await this.prisma.xs_logs.findMany({
      where: {
        user_id: data.sender_id,
        number: {
          in: numbers,
        },
        is_active: true,
      },
    });

    if (checkExist.length > 0) {
      const message = `❌ Bạn đã chơi số ${checkExist.map((item) => item.number).join(', ')} trước đó!`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    const time = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const hours = Number(String(time).substring(0, 2));

    if (hours < 0 || hours >= 18) {
      const message = `❌ Chỉ được chơi xổ số từ 00:00 đến 18:00 hàng ngày.`;
      await this.mezon.sendMessage({
        reply_to_message_id: data.message_id,
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.xs_logs.createMany({
          data: numbers.map((number) => ({
            user_id: data.sender_id,
            cost: this.xsCost,
            number,
            channel_id: data.channel_id,
            clan_id: data.clan_id,
            is_public: data.is_public,
            username: data.username,
            mode: String(data.mode || EMessageMode.CHANNEL_MESSAGE),
          })),
        }),
        tx.transaction_send_logs.createMany({
          data: numbers.map((number) => ({
            user_id: data.sender_id,
            amount: this.xsCost,
            to_user_id: 'fumo',
            note: `xs_${time}_${number}`,
          })),
        }),
        tx.user_balance.update({
          where: { user_id: data.sender_id },
          data: {
            balance: {
              decrement: totalCost,
            },
          },
        }),
        this.mezon.sendMessage({
          type: 'channel',
          reply_to_message_id: data.message_id,
          clan_id: data.clan_id,
          payload: {
            channel_id: data.channel_id,
            message: {
              type: 'system',
              content: `🎰 Đã cược số ${numbers.join(', ')} với giá ${totalCost} token\nKết quả sẽ được công bố khi có kết quả.`,
            },
          },
        }),
      ]);
    });
  }

  async checkTime(data: ChannelMessage) {
    const time = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const hours = Number(String(time).substring(0, 2));
    const message = `🕒 Thời gian hiện tại: ${time}\n🕒 Giờ hiện tại: ${hours}`;
    await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: message,
        },
      },
    });
  }

  async checkXs() {
    const kqxs = await this.kqxs();
    const check = await this.prisma.kqxs.findFirst({
      where: {
        indetifier: kqxs.time,
      },
    });
    if (check) return;
    await this.checkXSMB(kqxs);
    await this.checkLot(kqxs);
  }

  async checkLot(kqxs: XsResponse) {
    const prizeNumber = kqxs.results['ĐB'].at(0)?.substring(0, 4) ?? '';
    const luckNumbers = [
      Number(prizeNumber.slice(0, 2)),
      Number(prizeNumber.slice(2, 4)),
    ];
    if (luckNumbers.some((num) => isNaN(num))) {
      return;
    }

    // Find users who have at least 2 of the lucky numbers
    const tenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 10));

    // Get all active lot logs for the lucky numbers
    const lotLogs = await this.prisma.lot_logs.findMany({
      where: {
        is_active: true,
        number: {
          in: luckNumbers,
        },
        created_at: {
          gte: tenDaysAgo,
        },
      },
      select: {
        user_id: true,
        channel_id: true,
        clan_id: true,
        mode: true,
        is_public: true,
        username: true,
        number: true,
      },
    });

    // Group by user_id and count distinct numbers
    const userNumberCounts = new Map();
    lotLogs.forEach((log) => {
      if (!userNumberCounts.has(log.user_id)) {
        userNumberCounts.set(log.user_id, {
          user_id: log.user_id,
          channel_id: log.channel_id,
          clan_id: log.clan_id,
          mode: log.mode,
          is_public: log.is_public,
          username: log.username,
          numbers: new Set(),
        });
      }
      userNumberCounts.get(log.user_id).numbers.add(log.number);
    });

    // Filter users with at least 2 distinct numbers
    const winners = Array.from(userNumberCounts.values())
      .filter((user) => user.numbers.size >= 2)
      .map((user) => ({
        user_id: user.user_id,
        channel_id: user.channel_id,
        clan_id: user.clan_id,
        mode: user.mode,
        is_public: user.is_public,
        username: user.username,
        number_count: user.numbers.size,
      }));

    if (winners.length === 0) return;

    const rewardTotal = await this.prisma.lot_logs.aggregate({
      where: {
        is_active: true,
      },
      _sum: {
        cost: true,
      },
    });

    if (!rewardTotal._sum.cost) return;
    const rewardForEachWinner = Math.floor(
      rewardTotal._sum.cost / winners.length,
    );

    const channelForNotify = await this.prisma.lot_logs.findMany({
      distinct: ['channel_id'],
      select: {
        channel_id: true,
        clan_id: true,
        is_public: true,
        mode: true,
      },
    });

    const channelSentList: string[] = [];
    for (const channel of channelForNotify) {
      const channelId = channel.channel_id;
      if (channelSentList.includes(channelId)) continue;
      channelSentList.push(channelId);
      try {
        const message = `🎉 Kết quả LOT ngày ${kqxs.time}\n🔑 Xin chúc mừng ${winners.map((winner) => winner.username).join(', ')} đã chiến thắng giải đặc biệt với trị giá ${rewardForEachWinner} token\nCặp số may mắn bao gồm ${luckNumbers.join(' và ')}\nMột lần nữa, xin chúc mừng bạn!!`;
        await this.mezon.sendMessage({
          type: 'channel',
          clan_id: channel.clan_id,
          payload: {
            channel_id: channelId,
            message: {
              type: 'system',
              content: message,
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.lot_logs.updateMany({
          where: {
            is_active: true,
          },
          data: {
            is_active: false,
          },
        }),
        tx.user_balance.updateMany({
          where: {
            user_id: {
              in: winners.map((winner) => winner.user_id),
            },
          },
          data: {
            balance: {
              increment: rewardForEachWinner,
            },
          },
        }),
        tx.transaction_send_logs.createMany({
          data: winners.map((winner) => ({
            user_id: 'fumo',
            amount: rewardForEachWinner,
            to_user_id: winner.user_id,
            note: `lot_${kqxs.time}`,
          })),
        }),
      ]);
    });
  }

  async checkXSMB(kqxs: XsResponse) {
    //! Get full kq
    const luckyNum = kqxs.results['ĐB'].at(0)?.slice(-2);

    if (!luckyNum) return;

    const luckyNumber = parseInt(luckyNum);
    if (isNaN(luckyNumber)) return;

    const kq = await this.prisma.xs_logs.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    if (kq.length === 0) {
      await this.prisma.kqxs.create({
        data: {
          indetifier: kqxs.time,
          result: luckyNumber.toString(),
        },
      });
      return;
    }

    const entriesWithDistance = kq.map((entry) => ({
      ...entry,
      distance: Math.abs(entry.number - luckyNumber),
    }));

    entriesWithDistance.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return a.number - b.number;
    });

    const minDistance =
      entriesWithDistance.length > 0 ? entriesWithDistance[0].distance : 0;

    const closestEntries = entriesWithDistance.filter(
      (entry) => entry.distance === minDistance,
    );

    closestEntries.sort((a, b) => a.number - b.number);

    const winners =
      closestEntries.length > 1
        ? closestEntries
        : entriesWithDistance.slice(0, 1);

    const rewardTotal = kq.reduce((acc, winner) => acc + winner.cost, 0);
    const rewardForEachWinner = Math.floor(rewardTotal / winners.length);

    const uniqueChannelById = await this.prisma.xs_logs.findMany({
      where: {
        is_active: true,
      },
      distinct: ['channel_id', 'mode'],
      select: {
        channel_id: true,
        clan_id: true,
        mode: true,
        is_public: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const message = `🎉 Kết quả xổ số ngày ${kqxs.time}\n🔑 Con số may mắn: ${luckyNumber}\n🔑 Con số trúng giải: ${winners?.[0].number}\n💰 Tổng thưởng: ${rewardTotal} token\n💰 Thưởng cho mỗi người: ${rewardForEachWinner} token\n🎉 Xin chúc mừng ${winners.map((winner) => winner.username).join(', ')} đã chiến thắng.`;
    const channelSentList: string[] = [];
    for (const channel of uniqueChannelById) {
      try {
        if (channelSentList.includes(channel.channel_id + '|' + channel.mode))
          continue;
        channelSentList.push(channel.channel_id + '|' + channel.mode);
        await this.mezon.sendMessage({
          type: 'channel',
          clan_id: channel.clan_id,
          payload: {
            channel_id: channel.channel_id,
            message: {
              type: 'system',
              content: message,
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.user_balance.updateMany({
          where: {
            user_id: {
              in: winners.map((winner) => winner.user_id),
            },
          },
          data: {
            balance: {
              increment: rewardForEachWinner,
            },
          },
        }),
        tx.kqxs.create({
          data: {
            indetifier: kqxs.time,
            result: luckyNumber.toString(),
          },
        }),
        tx.transaction_send_logs.createMany({
          data: winners.map((winner) => ({
            user_id: 'fumo',
            amount: rewardForEachWinner,
            to_user_id: winner.user_id,
            note: `xs_${kqxs.time}`,
          })),
        }),
        tx.xs_logs.updateMany({
          where: {
            is_active: true,
          },
          data: {
            is_active: false,
          },
        }),
      ]);
    });
  }

  async playLot(data: ChannelMessage, number: number[]) {
    // only play between 00:00 and 18:00

    const time = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const hours = Number(String(time).substring(0, 2));
    if (hours < 0 || hours >= 18) {
      const message = `❌ Chỉ được chơi xổ số từ 00:00 đến 18:00 hàng ngày.`;
      await this.mezon.sendMessage({
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    const cost = number.length * this.lotCost;
    const user = await this.userService.getUserBalance(data);
    if (!user || user?.balance < cost) {
      const message = `❌ Bạn không có đủ ${cost} token để mua ${number.length} con số`;
      await this.mezon.sendMessage({
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    //too many number
    if (number.length > 4) {
      const message = `❌ Bạn chỉ được mua tối đa 4 con số`;
      await this.mezon.sendMessage({
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    //bought too many number
    const boughtNumber = await this.prisma.lot_logs.findMany({
      where: {
        user_id: data.sender_id,
        is_active: true,
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    if (boughtNumber.length + number.length > 4) {
      const message = `❌ Bạn mua quá nhiều con số hôm nay\nChỉ được mua tối đa 4 con số mỗi ngày.\nHãy chờ ngày mai nhé!`;
      await this.mezon.sendMessage({
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    //check exist number
    const existNumber = await this.prisma.lot_logs.findMany({
      where: {
        number: {
          in: number,
        },
        is_active: true,
        created_at: {
          gte: new Date(new Date().setDate(new Date().getDate() - 10)),
        },
        user_id: data.sender_id,
      },
    });

    if (existNumber.length > 0) {
      const message = `❌ Số ${existNumber.map((number) => number.number).join(', ')} bạn đã mua trước đó!`;
      await this.mezon.sendMessage({
        type: 'channel',
        clan_id: data.clan_id,
        payload: {
          channel_id: data.channel_id,
          message: {
            type: 'system',
            content: message,
          },
        },
      });
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.lot_logs.createMany({
          data: number.map((number) => ({
            number,
            user_id: data.sender_id,
            cost: this.lotCost,
            channel_id: data.channel_id,
            clan_id: data.clan_id,
            is_public: data.is_public,
            username: data.username,
            mode: String(data.mode || EMessageMode.CHANNEL_MESSAGE),
            is_active: true,
          })),
        }),
        tx.transaction_send_logs.createMany({
          data: number.map((number) => ({
            user_id: data.sender_id,
            amount: this.lotCost,
            to_user_id: 'fumo',
            note: `lot_${number}`,
          })),
        }),
        tx.user_balance.update({
          where: { user_id: data.sender_id },
          data: {
            balance: { decrement: cost },
          },
        }),
        this.mezon.sendMessage({
          type: 'channel',
          clan_id: data.clan_id,
          payload: {
            channel_id: data.channel_id,
            message: {
              type: 'system',
              content: `🎉 Bạn đã mua ${number.length} con số (${number.join(', ')}) với giá ${cost} token! \n🎉 Giải sẽ quay vào 18:30 mỗi ngày và thông báo khi có người may mắn trúng giải!\nLưu ý rằng: Mỗi con số chỉ có hiệu lực trong 10 ngày kể từ thời điểm bạn mua, sau 10 ngày hoặc khi có người chiến thắng sẽ không còn hiệu lực.`,
            },
          },
        }),
      ]);
    });
  }

  async handleAnxin(data: ChannelMessage) {
    const parse = data.content.t?.split(' ');
    let token = 1000;
    let mess = 'Công đức vô dụng';
    let hasMessage = false;
    if (parse?.length && parse?.length > 1) {
      token = Number(parse?.[1]);
      if (!token || isNaN(token) || token < 0 || token > 1000000) {
        await this.mezon.sendMessage({
          reply_to_message_id: data.message_id,
          type: 'channel',
          payload: {
            channel_id: data.channel_id,
            message: {
              type: 'system',
              content:
                'Sai cú pháp rồi!\nNhập *anxin <số tiền> <lời kêu gọi>\nSố tiền tối thiểu là 0K và tối đa là 1M',
            },
          },
        });
        return;
      }
      mess = `${data.content.t?.split(' ').slice(2).join(' ')}`;
      hasMessage = true;
    }
    await this.mezon.sendMessage({
      reply_to_message_id: data.message_id,
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'optional',
          content: {
            components: [
              {
                components: [
                  {
                    id: `gift_${data.username}_${token}_${data.message_id}_${data.channel_id}_${data.clan_id}`,
                    type: EMessageComponentType.BUTTON,
                    component: {
                      label: 'Mủi lòng',
                      style: EButtonMessageStyle.SUCCESS,
                    },
                  },
                  {
                    id: `chegift_${data.username}_${token}_${data.message_id}_${data.channel_id}_${data.clan_id}`,
                    type: EMessageComponentType.BUTTON,
                    component: {
                      label: 'Chê',
                      style: EButtonMessageStyle.DANGER,
                    },
                  },
                ],
              },
            ],
            embed: [
              {
                color: '#3498DB',
                title: `[GÓC HẢO TÂM]\n${data.username} kêu gọi mọi người tặng ${token} token `,
                description: mess,
              },
            ],
          },
        },
      },
    });
  }

  async handlePressAnxin(data: MessageButtonClicked) {
    const parse = data.button_id?.split('_');
    const type = parse?.[0] as 'gift' | 'chegift';
    const username = parse?.[1];
    const token = parse?.[2];
    const messageId = parse?.[3];
    const channelId = parse?.[4];
    const clanId = parse?.[5];
    if (
      !username ||
      !messageId ||
      !channelId ||
      !clanId ||
      !token ||
      isNaN(Number(token))
    ) {
      return;
    }

    const $user = await this.prisma.user_balance.findFirst({
      where: {
        user_id: data.user_id,
      },
    });

    if (type === 'chegift') {
      await this.mezon.sendMessage({
        reply_to_message_id: messageId,
        type: 'channel',
        clan_id: clanId,
        payload: {
          channel_id: channelId,
          message: {
            type: 'system',
            content: `❌ ${$user?.username || 'Có người'} đã chê`,
          },
        },
      });
    } else if (type === 'gift') {
      if (Number($user?.balance || 0) < Number(token)) {
        await this.mezon.sendMessage({
          reply_to_message_id: messageId,
          type: 'channel',
          payload: {
            channel_id: channelId,
            message: {
              type: 'system',
              content: ` ${$user?.username || 'Có người'} mủi lòng trước ${username} nhưng không có tiền :))`,
            },
          },
        });
        return;
      }
      await this.prisma.$transaction(async (tx) => {
        await Promise.all([
          tx.user_balance.update({
            where: { user_id: $user?.user_id },
            data: { balance: { decrement: Number(token) } },
          }),
          tx.user_balance.updateMany({
            where: { username: username },
            data: { balance: { increment: Number(token) } },
          }),
          await this.mezon.sendMessage({
            reply_to_message_id: messageId,
            type: 'channel',
            payload: {
              channel_id: channelId,
              message: {
                type: 'system',
                content: `🎉 ${$user?.username || 'Có người'} đã cho ${username} ${token} token`,
              },
            },
          }),
        ]);
      });
    }
  }
}
