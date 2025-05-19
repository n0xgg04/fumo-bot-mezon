import { Injectable } from '@nestjs/common';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import { WorksAi } from './works.ai';
import { EMessageMode } from '../../../common/enums/mezon.enum';
import { debounce } from 'lodash';
import { EMessageRole } from '@prisma/client';
import { encode } from 'gpt-tokenizer';
import { MezonService } from 'src/v2/mezon/mezon.service';

@Injectable()
export class WorksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly worksAi: WorksAi,
    private readonly mezon: MezonService,
  ) {}

  async clearContext(data: ChannelMessage) {
    const placeholder = await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: 'Đang xoá...',
        },
      },
    });

    await this.prisma.fumo_assistant_message_logs.deleteMany({
      where: {
        user_id: data.sender_id,
        channel_id: data.channel_id,
        clan_id: data.clan_id,
      },
    });
    const m = 'Đã xoá';

    await this.mezon.updateMessage({
      clan_id: data.clan_id,
      channel_id: data.channel_id,
      message_id: placeholder.message_id,
      content: {
        type: 'system',
        content: m,
      },
    });
  }

  private async calculateTokens(text: string): Promise<number> {
    try {
      return encode(text).length;
    } catch (error) {
      return Math.ceil(text.length / 4);
    }
  }

  async ask(data: ChannelMessage) {
    const placeholder = await this.mezon.sendMessage({
      type: 'channel',
      clan_id: data.clan_id,
      payload: {
        channel_id: data.channel_id,
        message: {
          type: 'system',
          content: 'Đang xử lý...',
        },
      },
    });

    const agent = await this.worksAi.getAgent(data);

    if (!agent) {
      const m = 'Không tìm thấy agent';
      await this.mezon.updateMessage({
        clan_id: data.clan_id,
        channel_id: data.channel_id,
        message_id: placeholder.message_id,
        content: {
          type: 'system',
          content: m,
        },
      });
      return;
    }

    const userMessage = data.content?.t || '';
    const userTokens = await this.calculateTokens(userMessage);

    await this.prisma.fumo_assistant_message_logs.create({
      data: {
        fumo_assistant_id: agent.channel_agent.id,
        role: EMessageRole.user,
        message: userMessage,
        user_id: data.sender_id,
        clan_id: data.clan_id,
        channel_id: data.channel_id,
        mezon_message_id: data.message_id!,
      },
    });

    const totalTokensTook = await this.prisma.fumo_tokens_took.aggregate({
      where: {
        fumo_assistant_id: agent.channel_agent.id,
      },
      _sum: {
        tokens_took: true,
      },
    });

    if (
      BigInt(totalTokensTook._sum.tokens_took || 0) >=
      BigInt(agent.channel_agent.max_tokens)
    ) {
      const m = 'Đã vượt quá số lượng token cho phép';
      await this.mezon.updateMessage({
        clan_id: data.clan_id,
        channel_id: data.channel_id,
        message_id: placeholder.message_id,
        content: {
          type: 'system',
          content: m,
        },
      });
      return;
    }

    let content = '';
    const stream = await agent.chain?.stream(String(userMessage));
    await new Promise((res) => setTimeout(res, 1000));

    for await (const chunk of stream!) {
      content += chunk as string;
      const debouchFn = debounce(async () => {
        await this.mezon.updateMessage({
          clan_id: data.clan_id,
          channel_id: data.channel_id,
          message_id: placeholder.message_id,
          content: {
            type: 'system',
            content,
          },
        });
      }, 500);
      await debouchFn();
    }

    await new Promise((res) => setTimeout(res, 500));
    await this.mezon.updateMessage({
      clan_id: data.clan_id,
      channel_id: data.channel_id,
      message_id: placeholder.message_id,
      content: {
        type: 'system',
        content,
      },
    });

    const assistantTokens = await this.calculateTokens(content);
    const currentTotalTokens =
      (totalTokensTook._sum.tokens_took || BigInt(0)) +
      BigInt(userTokens + assistantTokens);

    await this.prisma.$transaction(async (tx) => {
      const messageLog = await tx.fumo_assistant_message_logs.create({
        data: {
          fumo_assistant_id: agent.channel_agent.id,
          role: EMessageRole.assistant,
          message: content,
          user_id: data.sender_id,
          clan_id: data.clan_id,
          channel_id: data.channel_id,
          mezon_message_id: placeholder.message_id,
        },
      });
      await tx.fumo_tokens_took.upsert({
        where: {
          fumo_assistant_id: agent.channel_agent.id,
        },
        update: {
          tokens_took: currentTotalTokens,
        },
        create: {
          fumo_assistant_id: agent.channel_agent.id,
          tokens_took: BigInt(userTokens + assistantTokens),
          fumo_assistant_message_logs_id: messageLog.id,
        },
      });
    });
  }
}
