import { Injectable } from '@nestjs/common';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { db } from 'src/db';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { MezonService } from 'src/mezon/mezon.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InferResult, sql } from 'kysely';

@Injectable()
export class AvatarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mezon: MezonService,
    private readonly fumoMessage: FumoMessageService,
  ) {}

  async handleAvatar(message: ChannelMessage) {
    const avatar = message.references?.[0].mesages_sender_avatar;
    const ref = getRef(message);
    await this.mezon.sendMessageToChannel({
      clan_id: message.clan_id!,
      channel_id: message.channel_id,
      is_public: message.is_public || false,
      mode: EMessageMode.CHANNEL_MESSAGE,
      attachments: [
        {
          filename: 'avatar.png',
          filetype: 'image/png',
          height: 200,
          size: 200,
          url: avatar,
          width: 200,
          channel_id: message.channel_id,
          mode: EMessageMode.CHANNEL_MESSAGE,
          channel_label: message.channel_label,
          message_id: message.message_id!,
          sender_id: message.sender_id,
        },
      ],
      msg: {
        t: '',
      },
      ref: [ref],
    });
  }

  async handleRoommate(data: ChannelMessage) {
    const placeholder = await this.fumoMessage.sendSystemMessage(
      data,
      'Đang manifest...',
      data,
    );

    const m = `Roomate của bạn là `;

    const result = await this.prisma.$queryRawUnsafe<any>(
      'SELECT * FROM user_balance WHERE username != ? ORDER BY RAND() LIMIT 1',
      data.username,
    );

    const avatar = await this.prisma.message_logs.findFirst({
      where: {
        sender_id: result[0].user_id,
      },
      take: 1,
      orderBy: {
        created_at: 'desc',
      },
    });

    const username = result[0].username;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.mezon.updateMessage(
      data.clan_id!,
      placeholder!.channel_id,
      data.mode || EMessageMode.CHANNEL_MESSAGE,
      data.is_public || false,
      placeholder!.message_id,
      {
        t: `${m}@${username}\nLưu ý: Đây không phải thông tin chính thức, sẽ update khi có data từ HR.`,
      },
      [],
      [
        {
          filename: 'avatar.png',
          filetype: 'image/png',
          height: 200,
          size: 200,
          url: avatar?.sender_avatar,
          width: 200,
          channel_id: data.channel_id,
          mode: data.mode || EMessageMode.CHANNEL_MESSAGE,
          channel_label: data.channel_label,
          message_id: data.message_id!,
          sender_id: data.sender_id,
        },
      ],
    );
  }
}
