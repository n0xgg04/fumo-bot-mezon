import { Injectable } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';

@Injectable()
export class FumoMessageService {
  constructor(private readonly mezonService: MezonService) {}

  async sendTextToUser(context: ChannelMessage, message: string) {
    await this.mezonService.sendMessageToChannel({
      clan_id: context.clan_id!,
      channel_id: context.channel_id,
      is_public: context.is_public || false,
      mode: EMessageMode.CHANNEL_MESSAGE,
      msg: {
        t: message,
      },
    });
  }

  async sendSystemMessage(
    context: ChannelMessage,
    message: string,
    refContext?: ChannelMessage,
  ) {
    const ref = getRef(context);
    return this.mezonService.sendMessageToChannel({
      clan_id: context.clan_id!,
      channel_id: context.channel_id,
      is_public: context.is_public || false,
      mode: EMessageMode.CHANNEL_MESSAGE,
      msg: {
        t: message,
        mk: [
          {
            type: 'pre' as EMarkdownType,
            e: message.length,
            s: 0,
          },
        ],
      },
      ref: [ref],
    });
  }
}
