import { Injectable } from '@nestjs/common';
import { ChannelMessage, Events } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { DailyService } from './daily.service';

@Injectable()
export class DailyCommand {
  constructor(private readonly dailyService: DailyService) {}

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    if (message.content.t?.startsWith('*daily')) {
      await this.dailyService.handleDaily(message);
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleScanCV(message: ChannelMessage) {
    if (message.content.t?.startsWith('*scan-cv')) {
      const cvUrl = message.content.t.split(' ')[1];
      console.log(cvUrl, 'asking');
      await this.dailyService.scanCV(cvUrl, 'asking');
    }
  }
}
