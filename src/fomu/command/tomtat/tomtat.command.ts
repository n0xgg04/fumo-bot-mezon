import { Injectable } from '@nestjs/common';
import { TomTatService } from './tomtat.service';
import { ChannelMessage, Events } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TomTatCommand {
  constructor(private readonly tomTatService: TomTatService) {}

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    if (message.content.t?.startsWith('*tomtat')) {
      const lastMinuteFetch = message.content.t.substring(7);
      const filterNumberInString = Number(lastMinuteFetch.match(/\d+/g));
      const lastMinute = isNaN(filterNumberInString) ? 5 : filterNumberInString;

      await this.tomTatService.handleTomTat(message, lastMinute);
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessageHelp(message: ChannelMessage) {
    if (message.content.t?.startsWith('*fhelp')) {
      await this.tomTatService.handleHelp(message);
    }
  }
}
