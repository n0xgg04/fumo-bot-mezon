import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { AiService } from 'src/ai/ai.service';
import { MezonService } from 'src/mezon/mezon.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
@Injectable()
export class TomTatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly mezon: MezonService,
  ) {}

  async handleTomTat(message: ChannelMessage, lastMinute: number) {
    const ref = getRef(message);

    const promiseMessage = await this.mezon.sendMessageToChannel({
      channel_id: message.channel_id,
      clan_id: message.clan_id!,
      is_public: true,
      mode: EMessageMode.CHANNEL_MESSAGE,
      msg: {
        t: 'Đang tóm tắt...',
      },
      ref: [ref],
    });

    const messages = await this.prisma.message_logs.findMany({
      where: {
        channel_id: message.channel_id,
        clan_id: message.clan_id,
        created_at: {
          gte: new Date(Date.now() - lastMinute * 60 * 1000),
        },
      },
    });
    const messagesFetch = messages.map((message) => ({
      t: message.content!,
      sender_name: message.sender_name,
      send_at: message.created_at,
    }));
    const result = await this.aiService.generateTomtat(messagesFetch);
    await this.mezon.updateMessage(
      message.clan_id!,
      promiseMessage.channel_id,
      EMessageMode.CHANNEL_MESSAGE,
      true,
      promiseMessage.message_id,
      {
        t: result.content as string,
        mk: [
          {
            type: EMarkdownType.TRIPLE,
            e: result.content.length,
            s: 33 - 8,
          },
        ],
      },
      [ref],
    );
  }
}
