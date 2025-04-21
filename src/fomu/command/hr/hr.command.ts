import { Injectable } from '@nestjs/common';
import { HrService } from './hr.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'mezon-sdk';
import { ChannelMessage } from 'mezon-sdk';
import { MezonService } from 'src/mezon/mezon.service';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { EMessageMode } from 'src/common/enums/mezon.enum';

@Injectable()
export class HrCommand {
  constructor(
    private readonly hrService: HrService,
    private readonly mezon: MezonService,
    private readonly fumoMessage: FumoMessageService,
  ) {}

  @OnEvent(Events.ChannelMessage)
  async handleChannelMessage(message: ChannelMessage) {
    if (message.content.t?.startsWith('*scanCV')) {
      const parts = message.content.t.split(' ');
      if (parts.length < 3) {
        await this.fumoMessage.sendSystemMessage(
          message,
          'Please provide a PDF link and file name. Usage: *scanCV [pdf_link] [file_name]',
          message,
        );
        return;
      }

      const cvPdfLink = parts[1];
      const fileName = parts[2];

      const placeholder = await this.fumoMessage.sendSystemMessage(
        message,
        'Processing CV...',
        message,
      );

      const result = await this.hrService.handleScanCV(cvPdfLink, fileName);

      await this.mezon.updateMessage(
        message.clan_id!,
        message.channel_id,
        message.mode || EMessageMode.CHANNEL_MESSAGE,
        message.is_public || false,
        placeholder!.message_id,
        {
          t: result.message,
        },
      );
    } else if (message.content.t?.startsWith('*askCV')) {
      const parts = message.content.t.split(' ');
      if (parts.length < 3) {
        await this.mezon.updateMessage(
          message.clan_id!,
          message.channel_id,
          message.mode || EMessageMode.CHANNEL_MESSAGE,
          message.is_public || false,
          message.message_id!,
          {
            t: 'Please provide a file name and question. Usage: *askCV [file_name] [question]',
          },
        );
        return;
      }

      const fileName = parts[1];
      const question = parts.slice(2).join(' ');

      const placeholder = await this.fumoMessage.sendSystemMessage(
        message,
        'Analyzing CV...',
        message,
      );

      const result = await this.hrService.askAboutCV(fileName, question);

      console.log('DONE');
      console.log(result);

      await this.mezon.updateMessage(
        message.clan_id!,
        message.channel_id,
        message.mode || EMessageMode.CHANNEL_MESSAGE,
        message.is_public || false,
        placeholder!.message_id,
        {
          t: result.message,
        },
      );
    }
  }
}
