import { Injectable, Logger } from '@nestjs/common';
import {
  ApiMessageMention,
  ApiMessageAttachment,
  MezonClient,
  TokenSentEvent,
  ChannelMessageContent,
} from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';

@Injectable()
export class MezonService {
  private readonly logger = new Logger(MezonService.name);
  private readonly client: MezonClient;

  constructor(clientConfigs: MezonClientConfig) {
    this.client = new MezonClient(clientConfigs.token);
  }

  async initializeClient() {
    try {
      this.logger.log('Initializing client');
      const result = await this.client.authenticate();
      this.logger.log('Authentication successful', result);
    } catch (error) {
      this.logger.error('Authentication error', error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }

  async sendTokenToUser(data: TokenSentEvent) {
    return this.client.sendToken(data);
  }

  async sendMessageToChannel({
    clan_id,
    channel_id,
    is_public = true,
    mode = EMessageMode.CHANNEL_MESSAGE,
    msg,
    mentions,
    attachments,
    ref,
  }: MezonMessageToChannel) {
    return await this.client.sendMessage(
      clan_id,
      channel_id,
      mode,
      is_public,
      msg,
      mentions,
      attachments,
      ref,
    );
  }

  async sendMessage(replyMessage: MezonSendMessageToChannelCore) {
    try {
      return await this.client.sendMessage(
        replyMessage.clan_id,
        replyMessage.channel_id,
        replyMessage.mode,
        replyMessage.is_public,
        replyMessage.msg,
        replyMessage.mentions,
        replyMessage.attachments,
        replyMessage.ref,
      );
    } catch (error) {
      this.logger.error('Error sending message', error);
    }
  }

  async sendMessageToUser(messageToUser: MezonSendMessageToUserCore) {
    try {
      return await this.client.sendDMChannelMessage(
        messageToUser.channelDmId,
        messageToUser.textContent ?? '',
        messageToUser.messOptions ?? {},
        messageToUser.attachments ?? [],
        messageToUser.refs ?? [],
      );
    } catch (error) {
      this.logger.error('Error sending message to user', error);
    }
  }

  async createDMchannel(userId: string) {
    try {
      return await this.client.createDMchannel(userId);
    } catch (error) {
      this.logger.error('Error creating DM channel', error);
    }
  }

  async updateMessage(
    clan_id: string,
    channel_id: string,
    mode: number,
    is_public: boolean,
    message_id: string,
    content: ChannelMessageContent,
    mentions?: Array<ApiMessageMention>,
    attachments?: Array<ApiMessageAttachment>,
    hideEditted?: boolean,
  ) {
    try {
      return await this.client.updateChatMessage(
        clan_id,
        channel_id,
        mode,
        is_public,
        message_id,
        content,
      );
    } catch (error) {
      this.logger.error('Error updating message', error);
    }
  }

  async reactMessageChannel(dataReact: MezonReactMessageChannelCore) {
    try {
      return await this.client.reactionMessage(
        '',
        dataReact.clan_id,
        dataReact.channel_id,
        EMessageMode.CHANNEL_MESSAGE,
        dataReact.is_public,
        dataReact.message_id,
        dataReact.emoji_id,
        dataReact.emoji,
        dataReact.count,
        dataReact.message_sender_id,
        false,
      );
    } catch (error) {
      this.logger.error('Error reacting to message', error);
    }
  }
}
