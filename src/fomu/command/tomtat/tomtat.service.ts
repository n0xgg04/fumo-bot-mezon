import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { AiService } from 'src/ai/ai.service';
import { MezonService } from 'src/mezon/mezon.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
@Injectable()
export class TomTatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly mezon: MezonService,
    private readonly fumoMessage: FumoMessageService,
  ) {}

  async handleHelp(message: ChannelMessage) {
    await this.fumoMessage.sendSystemMessage(
      message,
      `🤖FUMO BOT\n*tomtat <n phút> : Tóm tắt hội thoại trong channel hiện tại từ n phút trước\n*fhelp : Hiển thị danh sách lệnh\n*fping : Kiểm tra bot\n*kttk: Kiểm tra số lượng token đang có\n*rut <n token>: Rút n token về tài khoản Mezon\nĐể nạp tiền, hãy chuyển token trực tiếp cho FOMU.\n\n🕹️GAME:\n*kbb <n token> : Chơi kéo búa bao với đối thủ, cần reply tin nhắn đối thủ(cược n token, n>=0)\n*fxsmb: Xem thông tin xổ số miền bắc ngày hôm nay\n*fxs <xx>: Đặt 5000 token vào số xx (2 chữ số), kết quả sẽ thông báo khi có kết quả xổ số ngày hôm nay. Tất cả số tiền các người chơi cọc sẽ được chuyển cho người đặt số gần 2 số cuối của giải đặc biệt KQXS.\n*giaithuong: Xem tổng giải thưởng dành cho người chiến thắng`,
      message,
    );
  }

  async handleTomTat(message: ChannelMessage, lastMinute: number) {
    const ref = getRef(message);
    // { type: 'pre', e: 9, s: 3 }

    const promiseMessage = await this.mezon.sendMessageToChannel({
      channel_id: message.channel_id,
      clan_id: message.clan_id!,
      is_public: message.is_public || false,
      mode: message.mode ?? EMessageMode.CHANNEL_MESSAGE,
      msg: {
        t: 'Đang tóm tắt...',
      },
      ref: [ref],
    });

    const messages = await this.prisma.message_logs.findMany({
      where: {
        channel_id: message.channel_id,
        clan_id: message.clan_id,
        created_at: {
          gte: new Date(Date.now() - lastMinute * 60 * 1000),
        },
      },
    });
    const messagesFetch = messages.map((message) => ({
      t: message.content!,
      sender_name: message.sender_name,
      send_at: message.created_at,
    }));
    const result = await this.aiService.generateTomtat(messagesFetch);
    await this.mezon.updateMessage(
      message.clan_id!,
      promiseMessage.channel_id,
      message.mode || EMessageMode.CHANNEL_MESSAGE,
      message.is_public || false,
      promiseMessage.message_id,
      {
        t: result.content as string,
        mk: [
          {
            type: 'pre' as EMarkdownType,
            e: result.content.length,
            s: 24,
          },
        ],
      },
      [ref],
    );
  }
}
