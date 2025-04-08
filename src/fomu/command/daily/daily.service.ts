import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { AiService } from 'src/ai/ai.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { MezonService } from 'src/mezon/mezon.service';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DailyService {
  constructor(
    private readonly aiService: AiService,
    private readonly mezon: MezonService,
    private readonly fumoMessage: FumoMessageService,
  ) {}

  async handleDaily(message: ChannelMessage) {
    const ref = getRef(message);
    const keyword = message.content.t!.substring(7);
    if (keyword.trim() === '') {
      return;
    }
    const promiseReply = await this.fumoMessage.sendSystemMessage(
      message,
      'Đang tạo daily...',
      message,
    );

    const date = new Date().toLocaleDateString('vi-VN');
    const daily = await this.aiService.generateDaily(keyword, date);
    await this.mezon.updateMessage(
      message.clan_id!,
      promiseReply.channel_id,
      EMessageMode.CHANNEL_MESSAGE,
      message.is_public || false,
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
