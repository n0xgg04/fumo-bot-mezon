import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorksCommand } from './works.command';
import { WorksService } from './works.service';
import { WorksAi } from './works.ai';
import { MezonModule } from 'src/v2/mezon/mezon.module';
import { FomuLogService } from 'src/v2/message_log/fomu.service';

@Module({
  imports: [PrismaModule, MezonModule],
  providers: [WorksCommand, WorksService, WorksAi, MezonModule, FomuLogService],
})
export class WorksModule {}
