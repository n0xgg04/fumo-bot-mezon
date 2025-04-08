import { Injectable } from '@nestjs/common';
import { TopupService } from './topup.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events, TokenSentEvent } from 'mezon-sdk';
import { MessageButtonClickedEvent, TokenSentEventI } from './types';
import { MezonService } from 'src/mezon/mezon.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
@Injectable()
export class TopupEvent {
  constructor(
    private readonly topupService: TopupService,
    private readonly mezon: MezonService,
  ) {}

  @OnEvent(Events.TokenSend)
  async handleTokenCreated(data: TokenSentEventI) {
    await this.topupService.createToken(data);
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(data: ChannelMessage) {
    if (data.content.t === '*kttk') {
      await this.topupService.checkBalance(data);
    }
    if (data.content.t === '*fumo') {
      await this.topupService.ping(data);
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleCreateKBB(data: ChannelMessage) {
    if (data.content.t?.startsWith('*kbb')) {
      //filter number in string
      const numberInString = data.content.t.match(/\d+/);
      if (numberInString) {
        const number = parseInt(numberInString[0]);
        if (!isNaN(number)) {
          await this.topupService.createKBB(data, number);
        } else {
          await this.mezon.sendMessageToChannel({
            clan_id: data.clan_id!,
            channel_id: data.channel_id,
            is_public: true,
            mode: EMessageMode.CHANNEL_MESSAGE,
            msg: {
              t: 'Số tiền không hợp lệ',
              mk: [
                {
                  s: 0,
                  e: 'Số tiền không hợp lệ'.length,
                },
              ],
            },
          });
        }
      }
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessageButtonClicked(data: ChannelMessage) {
    if (data.content.t?.startsWith('*rut')) {
      const numberInString = data.content.t.match(/\d+/);
      if (numberInString) {
        const number = parseInt(numberInString[0]);
        if (number) {
          await this.topupService.withdraw(data, number);
        }
      }
    }
  }

  @OnEvent(Events.MessageButtonClicked)
  async handleMessageButtonClicked(data: MessageButtonClickedEvent) {
    await this.topupService.handleMessageButtonClicked(data);
  }
}
