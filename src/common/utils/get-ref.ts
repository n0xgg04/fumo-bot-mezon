import { ChannelMessage } from 'mezon-sdk';

export function getRef(message: ChannelMessage) {
  return {
    message_id: message.message_id!,
    message_ref_id: message.message_id!,
    ref_type: 1,
    message_sender_id: message.sender_id,
    message_sender_username: message.username,
    mesages_sender_avatar: message.avatar,
    message_sender_clan_nick: message.clan_nick,
    message_sender_display_name: message.display_name,
    content: message.content.t,
    has_attachment: Number(message.attachments?.length) > 0,
    channel_id: message.channel_id,
    mode: message.mode,
    channel_label: message.channel_label,
  };
}
