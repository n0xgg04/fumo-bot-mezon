import { Module } from '@nestjs/common';
import { DailyService } from './daily.service';
import { DailyCommand } from './daily.command';
import { AiModule } from 'src/v2/ai/ai.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MezonModule } from 'src/v2/mezon/mezon.module';

@Module({
  imports: [AiModule, PrismaModule, MezonModule],
  providers: [DailyService, DailyCommand],
  exports: [DailyService, DailyCommand],
})
export class DailyModule {}
