import { Injectable, Logger } from '@nestjs/common';
import { MezonService } from './mezon.service';
import {
  ApiMessageAttachment,
  ApiMessageRef,
  ChannelMessage,
  EMarkdownType,
} from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';

@Injectable()
export class FumoMessageService {
  private readonly logger = new Logger(FumoMessageService.name);
  constructor(private readonly mezonService: MezonService) {}

  async sendTextToUser(context: ChannelMessage, message: string) {
    await this.mezonService.sendMessageToChannel({
      clan_id: context.clan_id!,
      channel_id: context.channel_id,
      is_public: context.is_public || false,
      mode: context.mode || EMessageMode.CHANNEL_MESSAGE,
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
    return this.mezonService.sendMessageToChannel({
      clan_id: context.clan_id!,
      channel_id: context.channel_id,
      is_public: context.is_public || false,
      mode: context.mode || EMessageMode.CHANNEL_MESSAGE,
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
      ref: refContext ? [getRef(refContext)] : undefined,
    });
  }

  async sendTextDM(context: ChannelMessage | string, message: string) {
    const channelDM =
      typeof context === 'string'
        ? await this.mezonService.createDMchannel(context)
        : await this.mezonService.createDMchannel(context.sender_id);

    await this.mezonService.sendMessageToUser({
      channelDmId: channelDM?.channel_id || '',
      textContent: message,
      messOptions: {},
      attachments: [],
      refs:
        typeof context === 'string'
          ? []
          : [
              {
                id: context.message_id,
                type: 'message',
                channel_id: context.channel_id,
                clan_id: context.clan_id,
                sender_id: context.sender_id,
              } as ApiMessageRef,
            ],
    });
  }
}
