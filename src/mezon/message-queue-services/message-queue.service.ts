import { Injectable } from '@nestjs/common';
import { MezonService } from '../mezon.service';
import { MessageQueueStore } from './message-queue-store.service';
import { generateChannelMessageContent } from 'src/common/utils/message';

@Injectable()
export class MessageQueueService {
  constructor(
    private readonly mezonService: MezonService,
    private readonly messageQueueStore: MessageQueueStore,
  ) {
    this.startMessageProcessor();
  }

  private async processDirectMessage(message: ReplyMezonMessage) {
    const dmChannel = await this.mezonService
      .getClient()
      .createDMchannel(message.mezonUserId!)
      .then((dmChannel) => {
        if (!dmChannel?.channel_id) return;
        this.mezonService.sendMessageToUser({
          attachments: [],
          channelDmId: dmChannel.channel_id,
          messOptions: {},
          refs: [],
          textContent: message.message,
        });
      })
      .catch((error) => {
        console.error('Error sending direct message:', error);
      });
  }

  private async processChannelMessage(message: ReplyMezonMessage) {
    try {
      await this.mezonService.sendMessage({
        clan_id: message.clan!.id,
        channel_id: message.channel!.id,
        is_public: message.isPublic,
        mode: message.messageMode,
        msg: generateChannelMessageContent({
          message: message.message,
          blockMessage: message.blockMessage,
        }),
      });
    } catch (error) {
      console.error('Error sending channel message:', error);
    }
  }

  private async processNextMessage() {
    if (!this.messageQueueStore.hasMessages()) return;

    const message = this.messageQueueStore.getNextMessage();
    if (!message) return;

    if (message.mezonUserId) {
      await this.processDirectMessage(message);
    } else {
      await this.processChannelMessage(message);
    }
  }

  private startMessageProcessor() {
    setInterval(async () => {
      await this.processNextMessage();
    }, 50);
  }
}
