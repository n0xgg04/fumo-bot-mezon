import { Injectable } from '@nestjs/common';
import { XsService } from './xs.service';
import { Events } from 'mezon-sdk';
import { ChannelMessage } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
@Injectable()
export class XsCommand {
  constructor(
    private readonly xsService: XsService,
    private readonly fumoMessage: FumoMessageService,
  ) {}

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(data: ChannelMessage) {
    if (data.content.t === '*fxsmb') {
      await this.xsService.getKqxs(data);
    } else if (data.content.t?.startsWith('*fxs')) {
      const number = parseInt(data.content.t.split(' ')[1]);
      if (!isNaN(number)) {
        await this.xsService.playXS(data, number);
      } else {
        const message = `❌ Sai cú pháp, vui lòng sử dụng lại lệnh`;
        await this.fumoMessage.sendSystemMessage(data, message, data);
      }
    } else if (data.content.t?.startsWith('*sxs')) {
      const number = parseInt(data.content.t.split(' ')[1]);
      if (!isNaN(number)) {
        await this.xsService.setXS(data, number);
      } else {
        const message = `❌ Sai cú pháp, vui lòng sử dụng lại lệnh`;
        await this.fumoMessage.sendSystemMessage(data, message, data);
      }
    } else if (data.content.t?.startsWith('*checkxs')) {
      if (data.username === 'anh.luongtuan') {
        await this.xsService.checkXs();
      } else {
        const message = `❌ Bạn không có quyền sử dụng lệnh này`;
        await this.fumoMessage.sendSystemMessage(data, message, data);
      }
    }
  }
}
