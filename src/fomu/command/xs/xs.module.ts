import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { XsService } from './xs.service';
import { XsCommand } from './xs.command';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../../user-service';
import { ScheduleModule } from '@nestjs/schedule';
import { XsCron } from './xs.cron';
@Module({
  imports: [PrismaModule, HttpModule, ScheduleModule.forRoot()],
  providers: [XsService, XsCommand, UserService, XsCron, Logger],
  exports: [XsService, XsCommand],
})
export class XsModule {}
