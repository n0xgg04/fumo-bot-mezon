import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMessageRole, fumo_assistant } from '@prisma/client';
import { ChannelMessage } from 'mezon-sdk';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

interface AgentInstance {
  agent: ChatDeepSeek | ChatOpenAI | ChatGoogleGenerativeAI;
  systemPrompt: string;
  maxTokens: number;
  channel_agent: fumo_assistant;
  chain?: RunnableSequence;
}

@Injectable()
export class WorksAi {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(WorksAi.name);

  async getAgentByModelName(modelName: string, key: string) {
    const modelNameLower = modelName.toLowerCase();

    if (modelNameLower.includes('deepseek')) {
      return new ChatDeepSeek({
        apiKey: key,
        model: modelName,
        maxTokens: Number(this.configService.get('AI_MAX_TOKENS')),
      });
    } else if (modelNameLower.includes('gpt')) {
      return new ChatOpenAI({
        apiKey: key,
        model: modelName,
        maxTokens: Number(this.configService.get('AI_MAX_TOKENS')),
      });
    } else if (modelNameLower.includes('gemini')) {
      return new ChatGoogleGenerativeAI({
        apiKey: key,
        model: modelName,
        maxOutputTokens: Number(this.configService.get('AI_MAX_TOKENS')),
      });
    } else {
      throw new Error(`Unsupported model: ${modelName}`);
    }
  }

  async getAgent(data: ChannelMessage): Promise<AgentInstance | null> {
    let agent = await this.prisma.fumo_assistant.findFirst({
      where: {
        channel_id: data.channel_id,
        clan_id: data.clan_id,
      },
      take: 1,
    });

    if (!agent) {
      agent = await this.prisma.fumo_assistant.create({
        data: {
          channel_id: data.channel_id,
          clan_id: data.clan_id!,
          ai_model: this.configService.get('AI_MODEL'),
          api_key: this.configService.get('AI_API_KEY'),
          max_tokens: this.configService.get('AI_MAX_TOKENS'),
          system_prompt: this.configService.get('AI_SYSTEM_PROMPT'),
        },
      });
      await this.prisma.fumo_assistant_message_logs.create({
        data: {
          fumo_assistant_id: agent.id,
          role: EMessageRole.system,
          message: String(agent.system_prompt),
          clan_id: data.clan_id,
          channel_id: data.channel_id,
          user_id: data.sender_id,
        },
      });
    }

    const chatModel = await this.getAgentByModelName(
      String(agent.ai_model),
      String(agent.api_key),
    );

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', String(agent.system_prompt)],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);

    const chain = RunnableSequence.from([
      async (input: string) => {
        const messageLogs =
          await this.prisma.fumo_assistant_message_logs.findMany({
            where: {
              fumo_assistant_id: agent.id,
              user_id: data.sender_id,
              clan_id: data.clan_id,
              channel_id: data.channel_id,
            },
            orderBy: {
              created_at: 'asc',
            },
            take: 100,
          });

        const messages = messageLogs
          .filter((log) => log.role !== EMessageRole.system)
          .map((log) => {
            if (log.role === EMessageRole.user) {
              return new HumanMessage(log.message);
            } else if (log.role === EMessageRole.assistant) {
              return new AIMessage(log.message);
            }
          })
          .filter(Boolean);

        return {
          input,
          chat_history: messages || [],
        };
      },
      prompt,
      chatModel,
      new StringOutputParser(),
    ]);

    return {
      agent: chatModel,
      channel_agent: agent,
      systemPrompt: String(agent.system_prompt),
      maxTokens: Number(agent.max_tokens),
      chain,
    };
  }
}
