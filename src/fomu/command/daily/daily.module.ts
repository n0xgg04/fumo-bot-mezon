import { Module } from '@nestjs/common';
import { DailyService } from './daily.service';
import { DailyCommand } from './daily.command';
import { AiModule } from 'src/ai/ai.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AiModule, PrismaModule],
  providers: [DailyService, DailyCommand],
  exports: [DailyService, DailyCommand],
})
export class DailyModule {}
