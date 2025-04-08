import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { ChatDeepSeek } from '@langchain/deepseek';

@Module({
  imports: [PrismaModule],
  providers: [
    AiService,
    {
      provide: 'AI',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new ChatDeepSeek({
          model: configService.get('AI_MODEL'),
          apiKey: configService.get('AI_API_KEY'),
        });
      },
    },
  ],
  exports: [AiService],
})
export class AiModule {}
