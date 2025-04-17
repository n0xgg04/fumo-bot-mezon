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
  async handleLotMessage(data: ChannelMessage) {
    if (data.content.t?.startsWith('*lot')) {
      const numbers = data.content.t.split(' ').slice(1);
      const numberArray = numbers.map((number) => parseInt(number));
      if (
        numberArray.every((number) => !isNaN(number)) &&
        numberArray.length != 0
      ) {
        await this.xsService.playLot(data, numberArray);
      } else {
        const message = `❌ Sai cú pháp, vui lòng sử dụng lại lệnh`;
        await this.fumoMessage.sendSystemMessage(data, message, data);
      }
    } else if (data.content.t?.startsWith('*giaithuonglot')) {
      await this.xsService.giaiThuongLot(data);
    } else if (data.content.t?.startsWith('*thelelot')) {
      await this.xsService.theLeLot(data);
    } else if (data.content.t?.startsWith('*mylot')) {
      await this.xsService.getLotNumbers(data);
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(data: ChannelMessage) {
    if (data.content.t === '*fxsmb') {
      await this.xsService.getKqxs(data);
    } else if (
      data.content.t?.startsWith('*fxs') ||
      data.content.t?.startsWith('*datso')
    ) {
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
    } else if (data?.content.t === '*giaithuong') {
      await this.xsService.giaiThuong(data);
    } else if (data?.content.t === '*checktime') {
      await this.xsService.checkTime(data);
    } else if (data?.content.t === '*mynumbers') {
      await this.xsService.myNumbers(data);
    }
  }
}
