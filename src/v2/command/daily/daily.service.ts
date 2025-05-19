import { Injectable } from '@nestjs/common';
import { ApiMessageAttachment, ChannelMessage } from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { MezonService } from 'src/v2/mezon/mezon.service';
import { AiService } from 'src/v2/ai/ai.service';

@Injectable()
export class DailyService {
  constructor(
    private readonly aiService: AiService,
    private readonly mezon: MezonService,
  ) {}

  async handleBuzz(message: ChannelMessage) {
    const ref = getRef(message);
    await this.mezon.sendMessage({
      type: 'channel',
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'normal_text',
          content: '',
        },
        images: [
          {
            filename: 'image.png',
            size: 633,
            url: 'https://i.ibb.co/4nNK0FTh/1744275493060-0image.png',
            filetype: 'image/png',
            width: 41,
            height: 14,
            thumbnail: 'BUZZ',
          } as ApiMessageAttachment,
        ],
      },
    });
  }

  async handleDaily(message: ChannelMessage) {
    const ref = getRef(message);
    const keyword = message.content.t!.substring(7);
    if (keyword.trim() === '') {
      return;
    }
    // const promiseReply = await this.fumoMessage.sendSystemMessage(
    //   message,
    //   'Đang tạo daily...',
    //   message,
    // );

    // if (!promiseReply) return;

    // const date = new Date().toLocaleDateString('vi-VN');
    // const daily = await this.aiService.generateDaily(keyword, date);
    // await this.mezon.updateMessage(
    //   message.clan_id!,
    //   promiseReply.channel_id,
    //   message.mode ?? EMessageMode.CHANNEL_MESSAGE,
    //   message.is_public || false,
    //   promiseReply.message_id,
    //   {
    //     t: daily.content as string,
    //   },
    //   [ref],
    // );
  }

  async scanCV(cvUrl: string, asking: string) {
    const docs = await this.aiService.scanCV(cvUrl, asking);
    console.log(docs);
  }
}
