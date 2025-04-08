import { Injectable } from '@nestjs/common';
import { ChannelMessage, Events } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { AvatarService } from './avatar.service';

@Injectable()
export class AvatarCommand {
  constructor(private readonly avatarService: AvatarService) {}

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    if (message.content.t?.startsWith('*avatar')) {
      await this.avatarService.handleAvatar(message);
    }
  }
}
