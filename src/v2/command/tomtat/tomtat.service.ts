import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { AiService } from 'src/v2/ai/ai.service';
import { MezonService } from 'src/v2/mezon/mezon.service';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { getRef } from 'src/common/utils/get-ref';
@Injectable()
export class TomTatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly mezon: MezonService,
  ) {}
  async handleBombadilocrocodilo(message: ChannelMessage) {
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: message.message_id,
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'normal_text',
          content: `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⠒⠋⠉⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⠄⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⣿⠟
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣶⣴⡆⢤⡀⣀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣷⣆⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⠏⠀
⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣰⠶⣦⡀⣀⣀⣴⣾⣿⣿⡿⠾⣿⣿⣹⣿⣎⣭⡝⠲⣄⠀⠀⠀⠙⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⠃⢀⣀
⠀⠀⠀⣀⣴⣾⣿⠛⠛⠟⠳⢦⣄⡀⠀⠀⠀⠀⠀⣀⣼⣿⣛⣭⣾⣿⣿⣿⣿⣿⡿⣯⣝⡛⠿⢿⣧⣌⣉⡙⠛⠓⠘⠦⣀⣀⠀⠈⠻⢿⣿⣿⣄⣀⣠⣶⣿⣿⣿⣿⡿⠁⠀⠀⠈
⠀⢀⣼⣿⣿⣿⣿⣷⣤⣀⠀⠀⣾⡙⠓⢶⣶⣞⠿⣯⣤⡴⠚⠉⠴⣯⠛⠛⢯⣩⡍⠉⢛⡛⠲⠤⣍⡻⢿⣿⣶⣤⡀⠀⠀⠉⠙⠒⠒⠪⢽⣿⣯⢻⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠠⡽⣿⣿⣻⣿⣿⡟⢻⡿⢾⣿⣿⣶⣼⣅⢸⡇⠀⡉⠀⣄⣄⠀⠀⠀⠀⠀⠉⠻⠿⣷⣿⣶⣴⣾⣶⣤⣉⠛⠿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣼⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠘⠻⢿⣿⣿⣿⣷⣼⣷⣿⣿⣿⣏⣿⠿⣿⣿⣤⣷⣿⣻⣿⣿⣶⣶⣄⣄⣀⣤⣄⣤⣿⣿⠛⠋⠙⠛⠿⢿⣶⣌⣿⣿⣷⠀⠰⢶⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⣠
⠀⠀⠀⠀⠀⠙⠉⠀⠋⠹⠹⠟⠿⣿⣿⣿⣿⣿⡅⢹⣿⣿⡿⣿⣯⣼⣟⣿⣻⣿⣿⣿⣿⣿⣿⣷⣶⣧⣤⠴⠚⣉⣹⣿⣿⢿⡇⠀⠀⠆⠀⠀⣻⣿⣿⣿⣿⣿⡿⢣⠀⠀⠀⣀⣭
⠀⠀⠀⠀⠀⡀⡀⢤⡀⠀⠀⣀⠀⣧⣹⣾⣿⣿⣷⣿⣿⢛⣧⠘⣟⢿⣿⣿⣿⠻⠛⠁⠀⠀⠀⠈⠉⠀⠀⣰⠾⠛⣿⣿⣿⣾⣿⣦⣤⣄⣀⣠⡟⢻⣿⣿⣿⣿⡿⠃⡄⠀⣸⠿⣿
⠀⠀⠀⠀⠀⣧⣽⣦⣝⢳⣶⣿⣧⠹⡟⢻⣧⠘⢿⠹⣧⠉⣻⣷⠜⠈⠃⠙⠀⠁⠀⠀⠀⠀⠀⠀⠀⠂⣾⡇⠀⣼⣿⣿⣛⣿⣿⣿⣿⣿⣿⣿⣥⣤⣿⣯⣙⠋⠀⠀⠀⠒⠉⠐⣻
⠀⠀⣰⣦⡀⠈⠻⢿⣿⣿⣿⣿⣿⣷⣿⣼⣿⣧⣬⣶⣤⣵⣾⣿⣦⣴⣦⣤⣤⣀⣠⣀⣀⣀⣀⡀⣀⣈⣩⣴⣾⣿⣻⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⣶⣶⣶⣖⠻⢿
⠀⠀⢻⣿⣿⣦⡀⠀⠀⠀⠉⣹⣿⣿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣶⣯⣿⣽⣿⣿⣿⣿⣯⣻⣿⣿⡇⠰⣾⣿⣿⣶⣤⣀⠀⠶⢶⣽⣟⠂
⠀⠀⠀⠙⢿⣿⣿⣆⠀⣠⣾⣿⣿⡿⢷⣄⡀⠀⠉⠙⣟⠛⢷⣤⣤⣧⣄⣡⡬⠿⠛⢿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⠟⣫⣭⣿⣻⣿⡷⣦⣤⣄⣀
⠀⠀⠀⠀⠀⠉⣿⣛⣾⣿⣿⣿⣿⣿⠀⠉⢓⣀⠀⠀⣸⡀⣸⣿⣷⣀⣾⣿⣿⣷⣶⣦⣤⣤⣈⣀⣀⠈⠙⠛⠛⠛⠻⠉⣠⡿⠃⠀⣈⣛⡛⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣯⣽
⠀⠀⠀⠀⠀⠀⠉⠻⣿⣿⣿⣿⣿⡿⠀⠀⢉⣩⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡻⠷⠶⠶⠤⢴⣿⣁⡀⠀⠛⠛⢿⡟⠂⢀⣿⣿⣥⣬⣿⣋⠛⣿⠿⣿⣿⣿
⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⢃⠀⠀⠀⠉⣩⣽⣿⣿⣿⣿⣿⣋⢉⣽⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣄⠀⠰⡇⠀⠈⠉⠁⠂⢸⣀⣀⣉⣀⡀⠉⠉⠛⣿⠶⠃⠀⠀⢘⡿
⠀⠀⠀⠀⠀⠀⣠⡿⢹⣿⣿⢿⣷⠎⠀⠄⠀⠚⠹⣿⣏⣛⣿⣟⠛⠛⣿⡿⣶⣶⣍⣙⣻⣿⣿⣿⣿⣿⣿⣿⠿⠋⣀⣇⣤⣴⣶⣾⣿⠿⠿⠛⠋⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠈⠀
⠀⠀⠀⠀⠀⣠⡿⠁⠀⠙⠛⠛⠿⠿⢶⣤⣤⣤⣾⣿⣿⣿⣿⢿⢦⣤⣿⣇⡀⣂⣽⠿⠿⠿⣛⣛⣻⣿⣴⣶⣿⠿⠿⠿⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣰⡿⠁⠀⠀⠀⢀⣠⣴⣶⣶⠖⠒⠛⠛⠛⠻⢿⣿⠷⠾⠋⠛⣚⣻⣭⣵⣶⡶⠾⠟⠛⠋⠉⠉⠠⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢠⡿⠁⢀⣠⣴⣾⡿⠟⠋⢀⡤⠤⠤⣤⡴⠀⠀⣀⣤⣴⣶⡾⠿⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣨⣷⣾⠿⠛⠉⠀⠀⠀⠀⠀⣒⣂⡭⠶⠶⠻⠛⠋⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠰⠾⠛⢉⣁⣀⣀⣀⣀⣠⠤⠶⠟⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣇⠈⠁⠀⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣴⣶⣾⣟⣛⣛⣻⣈⣳⣒⡤⠴⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⠿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⠖⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠈⢻⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
        },
      },
    });
  }

  async handleBrmbrmpatapim(message: ChannelMessage) {
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: message.message_id,
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'normal_text',
          content: `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠂⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠊⣠⣶⣿⣶⣶⣿⣿⣷⣤⣀⡀⠀⠀⢩⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣼⣯⣷⣿⡿⠟⠿⣿⣷⣶⣭⣛⠳⣄⠀⠉⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⡿⠀⠀⠀⠀⠉⣻⠏⠿⠿⠿⠓⠺⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡿⣿⣿⣿⣿⡿⠁⠀⠀⠀⣰⠶⡇⠀⠀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⠛⣿⣿⠁⠀⠀⠀⣼⣧⡀⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⢰⣿⣭⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣤⡀⠀⢸⠛⢿⣿⣿⡿⣷⡀⠀⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢨⣿⢧⣷⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠞⠁⠀⠘⣷⡄⣸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⡟⣼⣿⣿⣿⣏⠨⢿⣼⣿⣇⠀⠀⣀⣤⢾⠣⣀⠈⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣼⡇⣸⣿⣿⣿⣿⣤⡼⠉⠙⢿⣿⣿⣿⣷⣤⣶⡾⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢰⣿⣿⣽⣿⣿⣿⣿⢻⣿⠁⠀⠀⠀⢻⣿⣿⣿⡏⢹⢧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣿⣷⣿⡿⢿⣿⡿⠁⠀⠀⠀⣖⣺⣿⣿⣿⣷⣿⣤⠚⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀
⠀⠀⠀⠀⠀⢀⣽⣿⣿⡿⢛⣿⣷⣷⡀⠀⠀⠀⣼⣿⣿⣿⣿⣿⡿⢹⡦⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢸⠀
⠀⠀⠀⠀⣰⣿⣯⣽⣿⡄⣿⣿⣿⣿⣷⡀⠀⢸⣿⣿⣿⡿⣿⣿⡷⣯⣵⣌⠢⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣾⡇
⠀⠀⠀⣠⣿⣿⣿⣿⣿⣧⢛⣁⣹⣿⣿⣃⣀⢿⣿⣿⣿⡇⣿⣿⣷⣿⣿⠟⣷⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣾⣿⣿⣧
⠀⠀⠈⠻⣿⣿⣿⣿⣿⣾⣿⣿⣿⢿⠿⣟⣻⣿⣿⣿⣿⡷⣿⣿⣿⡻⠿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣶⣾⣿⣿⣿⣿⣿⣿
⠀⠉⠀⠚⣼⣿⣿⣿⣿⣿⣿⣿⡻⠧⣁⠀⠀⠙⣿⣿⣿⣷⣿⣿⡻⣿⡂⠀⠀⠙⢧⡀⠀⠀⠀⠀⠀⠀⠸⣿⢰⣸⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⠛⣿⠀⣄⠙⢄⠀⠈⠻⣿⠻⠛⠉⠙⠚⢯⡳⣄⠑⣄⠙⢦⣀⠀⠀⠀⠠⠤⢀⣀⠔⠛⠘⠛⠿⣛⣿⣿⣿
⡀⠀⠀⠼⠻⠋⠉⢻⠟⢿⡈⢠⣿⠘⣿⠳⡄⠳⡀⢢⠈⠳⢾⣷⣦⣤⣀⠉⠛⠷⣬⣑⠀⠈⠙⠲⠶⠤⠤⢤⣄⣀⡀⢾⣿⣿⣿⣿⣿⣿
⣁⣀⣀⣴⣤⣤⣀⣄⠀⠀⢳⠈⣿⡄⠘⣧⠘⢦⠹⡀⢵⣌⠓⢦⣭⡙⠻⢿⣦⣀⡀⠛⠦⠤⢤⣤⣈⠓⠢⣄⡀⠉⠙⠿⣿⠿⣿⣿⣿⠟
⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠈⡆⠘⣧⠀⢻⣷⡀⢿⣷⡀⠻⣷⣌⠛⠻⣶⠖⠂⠀⠙⠳⣶⣶⣶⡖⠿⣂⠀⠀⣉⡄⠀⠀⣘⡇⠈⠁⢠⠜
⠸⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣀⣴⡍⡆⠙⢿⡇⠈⢻⣿⡄⠈⢻⡷⠀⠈⠻⡷⣤⣂⠀⠀⠈⢻⣿⣿⣿⣶⣿⣿⣷⣤⡼⠟⠁⠀⠀⢴⣶
⠀⠀⠀⠙⠛⠛⠿⠿⠿⣿⣿⣿⣿⣿⣷⡄⠈⣿⣄⠀⢿⣶⠀⠀⢿⣄⡄⠀⢻⣶⣿⣧⣤⣤⡾⠛⠛⠛⠋⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀
⠸⠂⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠿⠿⠶⠿⣿⣧⣾⣿⣷⡤⠾⠿⠷⠶⠞⠛⠋⠉⣉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣠⣤⣦⣤⣴⣿`,
        },
      },
    });
  }

  async handleTralalerotralala(message: ChannelMessage) {
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: message.message_id,
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'normal_text',
          content: `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢹⣿⣿⣿⣿⣿⣿⣿⣜⣦⣳⣌⣶⣲⡵⣎⡵⣮⣵⢶⣱⣆⢶⡰⣤⢢⡔⣤⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠆⢘⣵⣿⣿⣿⣿⣿⣿⣿⣿⣟⠻⢛⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣽⣞⣧⣻⢴⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣜⢧⣫⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⢿⣯⡿⢒⣸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣛⣖⣉⣖⣲⣲⡶⣶⣲⣾⣾⣷⣦⡶⠶⣿⠟⠛⣿⣉⡶⢤⡜⢯⡕⡚⢇⢫⠱⠈⠁⠀⠀⠀⠀⠀⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣩⣭⣿⣶⡿⣷⠟⡿⢻⡵⢫⠜⡡⠚⠄⢂⠑⠈⠀⠂⢀⠀⠤⡀⠀⠀⠀⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⠿⡱⢫⠙⠣⠍⠃⠈⠠⠙⢀⠃⡝⡀⠂⠀⠁⠈⠀⠀⠀⠁⠀⠀⠀⡀⠀⠠⠀⠀⠀⠀⢸
⣟⠿⣻⠿⢿⠻⠟⡿⢿⣿⣿⣿⣿⣿⣻⣞⣿⡿⠻⡍⢃⠁⠂⠡⠈⠀⠀⠄⠀⠀⡀⢀⠐⡀⠄⠀⠄⠀⠠⠀⠁⠠⠁⠂⠄⠠⠐⠀⠐⠈⠀⣀⢸
⣯⠐⡹⠈⠄⠡⢈⠐⠣⢎⠽⣻⢿⣿⣿⣿⣿⢣⠁⡀⠄⠈⠐⠀⠀⠀⠈⡀⢀⠂⢄⡀⢂⡐⣈⣒⣀⣣⣰⣤⣣⣶⣬⣶⣼⣶⡟⣠⣾⣵⣿⡿⢸
⣧⢳⡖⣡⠌⡐⣀⢂⡐⡈⢐⣁⣛⢨⣓⣹⣬⠵⠶⠶⠚⠛⠓⠂⠀⠀⠁⠀⢬⣭⣬⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⣠⣭⣭⣭⣽⣿⢻
⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠿⠛⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⣰⣿⣿⣿⣿⣿⣿⣾
⣿⣿⣿⣿⣿⠿⠛⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠌⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⣰⣿⣿⣿⣿⣿⣿⣿⣾
⣿⣿⣿⣿⣿⣶⣐⣦⡴⣠⣷⣴⠶⠶⣖⣛⣚⣷⡷⣤⣶⡔⡄⡀⠀⠀⠀⠀⠀⢀⠀⠂⠄⠘⠛⢿⣿⠟⣿⣿⣿⠏⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⢻
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣖⣶⣿⡿⢿⣿⣿⢿⣿⣿⢿⡿⡖⡁⡀⠀⠀⠀⢀⣄⣀⡀⠀⠂⠀⠀⠀⠀⠙⠋⠁⠀⢀⡾⣟⣛⣟⣛⣻⣿⣭⣴⢼
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣾⢹⡿⢾⣟⣾⣵⣓⢎⣁⠀⠀⠀⠛⠿⢿⡶⢄⠀⠐⠶⠴⢒⣤⣭⠓⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣭⡟⣾⡟⣡⣶⣾⣤⣟⣬⣨⣧⡀⠀⠀⢡⣄⡤⢀⣤⣄⠀⠙⠚⣿⣿⣷⣤⣻⣿⣿⣿⣿⣿⣿⣿⣿⣻
⣯⣽⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠠⣴⠿⣿⣿⣿⣿⣿⣿⣿⣧⠀⠀⠘⣿⣿⣾⣿⠟⠀⡀⡐⡸⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣹
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⡀⠔⡠⠄⢀⠸⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⣿⣿⣿⠏⢛⠰⣁⠩⠂⠛⠿⠛⠛⠋⣀⣨⣍⣩⣩⣍⣭⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⣋⠰⠌⠐⢖⣊⣤⣤⡆⣿⣿⣿⣿⣿⠏⡁⢄⠀⠈⠉⠛⡿⠶⠆⠀⠀⡀⠄⠠⠀⠄⠀⢰⣶⣿⣿⣿⣿⣿⣿⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣷⡤⠚⠐⠢⠄⠚⠈⠀⠀⠀⠀⡀⠀⠽⣿⠟⠃⠔⡈⢠⠂⡄⠠⠁⠀⠄⠂⠈⡀⠄⠀⡁⢈⠠⠁⡀⢶⣿⣿⣿⡿⢿⣿⢹
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣶⣿⣿⣿⣿⣿⣿⣶⣤⣅⣀⡰⢌⡑⢢⠑⡄⠌⣠⠕⠁⠀⠀⠀⠁⠀⠀⠂⠀⡀⠠⠐⠀⡀⠈⣉⣿⣿⣾⣿⢺
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢛⣭⠯⡒⠥⢂⠜⡠⢂⠛⣊⡥⡴⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠹⣿⣿⣿⣿⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠁⠂⠆⡒⠡⠊⠁⣎⣠⠵⠚⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⠿⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠈⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣤⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡰⣶⣤⣄⢸
⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢙⣧⠻⣜⢸`,
        },
      },
    });
  }

  async handleTungtung(message: ChannelMessage) {
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: message.message_id,
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'normal_text',
          content: `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢟⣛⣛⣛⣛⡻⠿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢁⣺⣿⣿⣿⣿⣿⣿⣿⣶⠈⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠃⠼⢽⣿⣿⠿⠻⠛⠻⢿⣿⠀⣾
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠙⠁⠀⠀⢠⡀⠀⢬⠃⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠻⡄⠀⣇⠀⠃⠀⠘⡇⠀⠄⢿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⢈⢸⡿⣦⣀⢀⣀⣴⣿⡆⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠙⠳⠞⠁⠸⠷⠦⠈⠉⠉⠉⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠆⠀⠀⠤⠿⠂⠀⠀⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⡄⠀⠀⠀⠈⣠⡼⠃⠀⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠛⠉⠀⢀⠠⠀⠀⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠠⠀⠀⠀⠀⢤⠘⠤⠁⢰⡆⢸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⢠⠋⠤⡉⠐⡀⠀⢿⠸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠄⠀⠀⡘⢀⠆⠡⠀⠀⣈⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⡐⠈⠤⢁⠂⠀⡟⢰
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⡀⠀⠀⠀⠠⠁⠂⠄⠀⣸⠁⣸
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠁⠀⠀⠀⠀⠀⠀⠀⠈⠁⢰⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢁⠆⠀⠀⠀⢀⣐⠀⠀⠀⢀⣸⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⡁⠁⣼⡇⠀⠀⣿⣿⠀⡀⢀⣷⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⡔⠀⣼⣿⡇⣀⠀⣿⣿⡆⣡⠘⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⢡⡞⢀⣾⣿⣿⣇⠀⠀⢿⣿⡇⠁⠀⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡏⣴⡇⢠⣾⣿⣿⣿⣿⠀⠀⢸⣿⣧⠀⠀⣿⣿⣿
⣿⣿⣿⣿⣿⠏⣼⠍⢀⣿⣿⣿⣿⣿⣿⡀⠀⢸⣿⣿⡀⠀⣻⣿⣿
⣿⣿⣿⡿⠋⡸⠁⢀⣾⣿⣿⣿⣿⣿⣿⣇⢀⠈⣿⣿⡇⠀⢸⣿⣿
⣿⣿⠟⠁⠄⠀⢠⣾⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⢿⡿⠁⠀⠘⣿⣿
⡿⠋⠀⠀⠀⣠⣾⣿⣿⣿⠿⠛⣛⣹⡏⠀⠀⠀⠀⢠⣾⣆⠀⢻⣿
⣦⣀⡀⠀⢰⣿⣿⣿⡃⠄⠤⡶⠋⠉⣁⣠⣴⡆⠰⠛⠻⠻⠢⠘⣿
⣿⣿⣿⣷⣿⣿⣿⣿⣿⣷⣶⣶⣾⣿⣿⣿⣯⣁⣀⡊⣘⣀⣀⣤⣿`,
        },
      },
    });
  }

  async handleHelp(message: ChannelMessage) {
    await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: message.message_id,
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'system',
          content: `🤖FUMO BOT\n*tomtat <n phút> : Tóm tắt hội thoại trong channel hiện tại từ n phút trước\n*fumo : Hiển thị danh sách lệnh\n*fping : Kiểm tra bot\n*kttk: Kiểm tra số lượng token đang có\n*rut <n token>: Rút n token về tài khoản Mezon\nĐể nạp tiền, hãy chuyển token trực tiếp cho FOMU.\n\n🕹️GAME:\n*kbb <n token> : Chơi kéo búa bao với đối thủ, cần reply tin nhắn đối thủ(cược n token, n>=0)\n*topkbb: Xem top 10 người thắng kéo búa bao nhiều nhất\n*fxsmb: Xem thông tin xổ số miền bắc ngày hôm nay\n*fxs <xx>: Đặt 5000 token vào số xx (2 chữ số), tối đa 10 số/người, kết quả sẽ thông báo khi có kết quả xổ số ngày hôm nay. Tất cả số tiền các người chơi cọc sẽ được chuyển cho người đặt số gần 2 số cuối (ưu tiên bằng hoặc số bé hơn) của giải đặc biệt KQXS. Ví dụ số may mắn là 67, có người chơi chọn 67 sẽ nhận full giải, nếu không có, sẽ chọn số gần nhất ví dụ 66 hoặc 68. Nếu có cả 66 hoặc 68, sẽ ưu tiên 66. Nếu có >1 người trúng giải, sẽ chia đều giải cho người chiến thắng.\n*giaithuong: Xem tổng giải thưởng dành cho người chiến thắng\n*lot <danh sách số cách nhau bởi dấu cách>: Đặt số lot\n*thelelot: Đọc thể lệ chơi số lot\n*mylot: Xem các số lot của bạn.\n*giaithuonglot: Xem tổng giải thưởng LOT tích luỹ.`,
        },
      },
    });
  }

  async handleTomTat(message: ChannelMessage, lastMinute: number) {
    if (lastMinute > 15) {
      await this.mezon.sendMessage({
        type: 'channel',
        reply_to_message_id: message.message_id,
        payload: {
          channel_id: message.channel_id,
          message: {
            type: 'system',
            content: 'Giới hạn thời gian tối đa là 15 phút',
          },
        },
      });
      return;
    }

    const promiseMessage = await this.mezon.sendMessage({
      type: 'channel',
      reply_to_message_id: message.message_id,
      payload: {
        channel_id: message.channel_id,
        message: {
          type: 'normal_text',
          content: 'Đang tóm tắt...',
        },
      },
    });

    if (!promiseMessage) return;

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
    await this.mezon.updateMessage({
      channel_id: promiseMessage.channel_id,
      message_id: promiseMessage.message_id,
      content: {
        type: 'system',
        content: result.content as string,
      },
    });
  }
}
