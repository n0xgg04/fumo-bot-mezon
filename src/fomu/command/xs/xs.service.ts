import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { XsResponse } from './types/xs';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { MezonService } from 'src/mezon/mezon.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { UserService } from '../../user-service';
import { uniqBy } from 'lodash';

@Injectable()
export class XsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fumoMessage: FumoMessageService,
    private readonly mezon: MezonService,
    private readonly userService: UserService,
  ) {}

  private xsCost = 5000;

  async kqxs() {
    const response = await axios.get<XsResponse>(
      'https://api-xsmb-today.onrender.com/api/v1',
    );
    return response.data;
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
      await this.fumoMessage.sendSystemMessage(data, m, data);
    } else {
      await this.fumoMessage.sendSystemMessage(
        data,
        '❌ Bạn chưa chơi xổ số',
        data,
      );
    }
  }

  async getKqxs(data: ChannelMessage) {
    const placeholder = await this.fumoMessage.sendSystemMessage(
      data,
      'Đang tra cứu kết quả xổ số...',
      data,
    );
    if (!placeholder) return;
    const response = await this.kqxs();
    const { countNumbers, time, results } = response;
    let message = `🔍Kết quả xổ số ngày ${time}\n`;
    for (const key in results) {
      message += `${key}: ${results[key].join(', ')}\n`;
    }
    await this.mezon.updateMessage(
      data.clan_id!,
      data.channel_id,
      data.mode || EMessageMode.CHANNEL_MESSAGE,
      data.is_public!,
      placeholder.message_id,
      {
        t: message,
        mk: [
          {
            type: 'pre' as EMarkdownType,
            e: message.length,
            s: 0,
          },
        ],
      },
    );
  }

  async setXS(data: ChannelMessage, cost: number) {
    if (data.username != 'anh.luongtuan') {
      const message = `❌ Bạn không có quyền sử dụng lệnh này`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    }
    this.xsCost = cost;
    await this.fumoMessage.sendSystemMessage(
      data,
      `Đã thiết lập giá chơi xổ số thành ${cost} token`,
      data,
    );
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
    await this.fumoMessage.sendSystemMessage(data, message, data);
  }

  async playXS(data: ChannelMessage, number: number) {
    const user = await this.userService.getUserBalance(data);

    if (number < 0 || number > 99 || isNaN(number)) {
      const message = `❌ Số không hợp lệ\nSố phải lớn hơn 0 và nhỏ hơn 99`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    }

    if (!user || user?.balance < this.xsCost) {
      const message = `❌ Bạn không có đủ ${this.xsCost} token để chơi xổ số`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    }

    const countMe = await this.prisma.xs_logs.findMany({
      where: {
        user_id: data.sender_id,
        is_active: true,
      },
    });

    if (countMe.length >= 10) {
      const message = `❌ Bạn đã chơi xổ số quá nhiều lần`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    }

    const time = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const hours = Number(String(time).substring(0, 2));

    if (hours < 0 || hours >= 18) {
      const message = `❌ Chỉ được chơi xổ số từ 00:00 đến 18:00 hàng ngày.`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    }

    await Promise.all([
      this.prisma.xs_logs.create({
        data: {
          user_id: data.sender_id,
          cost: this.xsCost,
          number,
          channel_id: data.channel_id,
          clan_id: data.clan_id,
          is_public: data.is_public,
          username: data.username,
        },
      }),
      this.prisma.transaction_send_logs.create({
        data: {
          user_id: data.sender_id,
          amount: this.xsCost,
          to_user_id: 'fumo',
          note: `xs_${time}`,
        },
      }),
      this.prisma.user_balance.update({
        where: { user_id: data.sender_id },
        data: {
          balance: {
            decrement: this.xsCost,
          },
        },
      }),
      await this.fumoMessage.sendSystemMessage(
        data,
        `🎰 Đã cược số ${number} với giá ${this.xsCost} token\nKết quả sẽ được công bố khi có kết quả.`,
        data,
      ),
    ]);
  }

  async checkTime(data: ChannelMessage) {
    const time = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const hours = Number(String(time).substring(0, 2));
    const message = `🕒 Thời gian hiện tại: ${time}\n🕒 Giờ hiện tại: ${hours}`;
    await this.fumoMessage.sendSystemMessage(data, message, data);
  }

  async checkXs() {
    const kqxs = await this.kqxs();
    const check = await this.prisma.kqxs.findFirst({
      where: {
        indetifier: kqxs.time,
      },
    });
    if (check) return;

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

    if (kq.length === 0) return;

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

    const uniqueChannelById = uniqBy(kq, 'channel_id');

    const message = `🎉 Kết quả xổ số ngày ${kqxs.time}\n🔑 Con số may mắn: ${luckyNumber}\n🔑 Con số trúng giải: ${winners?.[0].number}\n💰 Tổng thưởng: ${rewardTotal} token\n💰 Thưởng cho mỗi người: ${rewardForEachWinner} token\n🎉 Xin chúc mừng ${winners.map((winner) => winner.username).join(', ')} đã chiến thắng.`;
    const channelSentList: string[] = [];
    for (const channel of uniqueChannelById) {
      const channelId = channel.channel_id;
      try {
        if (channelSentList.includes(channelId)) continue;
        channelSentList.push(channelId);
        await this.fumoMessage.sendSystemMessage(
          {
            channel_id: channelId,
            clan_id: channel.clan_id,
            mode: EMessageMode.CHANNEL_MESSAGE,
            is_public: channel.is_public,
          } as ChannelMessage,
          message,
          {} as ChannelMessage,
        );
      } catch (error) {
        console.log(error);
      }
    }
    // console.log(uniqueChannelById);
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
}
