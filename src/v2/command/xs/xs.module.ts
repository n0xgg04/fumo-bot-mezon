import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { XsService } from './xs.service';
import { XsCommand } from './xs.command';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { XsCron } from './xs.cron';
import { UserService } from 'src/v2/user/user-service';
import { MezonModule } from 'src/v2/mezon/mezon.module';
@Module({
  imports: [PrismaModule, HttpModule, ScheduleModule.forRoot(), MezonModule],
  providers: [XsService, XsCommand, UserService, XsCron, Logger],
  exports: [XsService, XsCommand],
})
export class XsModule {}
