import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorksCommand } from './works.command';
import { WorksService } from './works.service';
import { WorksAi } from './works.ai';
import { MezonModule } from 'src/mezon/mezon.module';
import { FomuLogService } from 'src/fomu/message_log/fomu.service';

@Module({
  imports: [PrismaModule],
  providers: [WorksCommand, WorksService, WorksAi, MezonModule, FomuLogService],
})
export class WorksModule {}
