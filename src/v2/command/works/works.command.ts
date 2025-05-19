import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessage, Events } from 'mezon-sdk';
import { OnEvent } from '@nestjs/event-emitter';
import { WorksService } from './works.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorksCommand {
  constructor(
    private readonly prisma: PrismaService,
    private readonly worksService: WorksService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(Events.ChannelMessage)
  async handleWorksCreate(data: ChannelMessage) {
    if (data.sender_id === this.configService.get('BOT_ID')) {
      return;
    }

    if (data.content?.t === '*clearcontext') {
      return this.worksService.clearContext(data);
    }

    if (
      data.content?.t?.startsWith('@Fumo') &&
      data.content?.t?.includes('ơi')
    ) {
      return this.worksService.ask(data);
    }

    const reference = data.references?.[0];
    if (
      reference?.message_ref_id &&
      reference?.message_sender_id === this.configService.get('BOT_ID')
    ) {
      const mess = await this.prisma.fumo_assistant_message_logs.count({
        where: {
          mezon_message_id: reference.message_ref_id,
          user_id: data.sender_id,
          clan_id: data.clan_id,
          channel_id: data.channel_id,
        },
      });
      if (mess) {
        return this.worksService.ask(data);
      }
    }
  }
}
