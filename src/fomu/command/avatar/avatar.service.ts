import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
import { MezonService } from 'src/mezon/mezon.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AvatarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mezon: MezonService,
  ) {}

  async handleAvatar(message: ChannelMessage) {
    const avatar = message.references?.[0].mesages_sender_avatar;
    const ref = getRef(message);
    await this.mezon.sendMessageToChannel({
      clan_id: message.clan_id!,
      channel_id: message.channel_id,
      is_public: true,
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
}
