import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { AiService } from 'src/ai/ai.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { MezonService } from 'src/mezon/mezon.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DailyService {
  constructor(
    private readonly aiService: AiService,
    private readonly mezon: MezonService,
  ) {}

  async handleDaily(message: ChannelMessage) {
    if (!message.content.t) {
      return;
    }
    const ref = getRef(message);
    const keyword = message.content.t.substring(7);
    if (keyword.trim() === '') {
      return;
    }
    const promiseReply = await this.mezon.sendMessageToChannel({
      clan_id: message.clan_id!,
      channel_id: message.channel_id,
      is_public: true,
      mode: EMessageMode.CHANNEL_MESSAGE,
      msg: { t: 'Đang tạo daily...' },
      ref: [ref],
    });

    const date = new Date().toLocaleDateString('vi-VN');
    const daily = await this.aiService.generateDaily(keyword, date);
    await this.mezon.updateMessage(
      message.clan_id!,
      promiseReply.channel_id,
      EMessageMode.CHANNEL_MESSAGE,
      true,
      promiseReply.message_id,
      {
        t: daily.content as string,
      },
      [ref],
    );
  }

  async scanCV(cvUrl: string, asking: string) {
    const docs = await this.aiService.scanCV(cvUrl, asking);
    console.log(docs);
  }
}
