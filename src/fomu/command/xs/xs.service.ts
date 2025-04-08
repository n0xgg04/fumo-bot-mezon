import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { XsResponse } from './types/xs';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { MezonService } from 'src/mezon/mezon.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { UserService } from '../../user-service';

@Injectable()
export class XsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fumoMessage: FumoMessageService,
    private readonly mezon: MezonService,
    private readonly userService: UserService,
  ) {}

  private xsCost = 5000;

  async getKqxs(data: ChannelMessage) {
    const placeholder = await this.fumoMessage.sendSystemMessage(
      data,
      'Đang tra cứu kết quả xổ số...',
      data,
    );
    const response = await axios.get<XsResponse>(
      'https://api-xsmb-today.onrender.com/api/v1',
    );
    const { countNumbers, time, results } = response.data;
    let message = `🔍Kết quả xổ số ngày ${time}\n`;
    for (const key in results) {
      message += `${key}: ${results[key].join(', ')}\n`;
    }
    await this.mezon.updateMessage(
      data.clan_id!,
      data.channel_id,
      EMessageMode.CHANNEL_MESSAGE,
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
  async playXS(data: ChannelMessage, number: number) {
    const user = await this.userService.getUserBalance(data);
    if (!user || user?.balance < this.xsCost) {
      const message = `❌ Bạn không có đủ ${this.xsCost} token để chơi xổ số`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    }
    const check = await this.prisma.xs_logs.findFirst({
      where: {
        user_id: data.sender_id,
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        is_active: true,
      },
    });
    if (check) {
      const message = `❌ Bạn đã chơi xổ số hôm nay rồi`;
      await this.fumoMessage.sendSystemMessage(data, message, data);
      return;
    } else {
      await Promise.all([
        this.prisma.xs_logs.create({
          data: {
            user_id: data.sender_id,
            cost: this.xsCost,
            number,
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
          `Đã cược số ${number} với giá ${this.xsCost} token\nKết quả sẽ được công bố vào lúc 18:30 hàng ngày`,
          data,
        ),
      ]);
    }
  }
}
