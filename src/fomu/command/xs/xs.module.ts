import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { XsService } from './xs.service';
import { XsCommand } from './xs.command';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../../user-service';
@Module({
  imports: [PrismaModule, HttpModule],
  providers: [XsService, XsCommand, UserService],
  exports: [XsService, XsCommand],
})
export class XsModule {}
