import { ChromeModule } from 'src/db/chroma/chrome.module';
import { HrService } from './hr.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HrCommand } from './hr.command';
import { MezonModule } from 'src/mezon/mezon.module';

@Module({
  imports: [ChromeModule, ConfigModule, MezonModule],
  providers: [HrService, HrCommand],
  exports: [HrService],
})
export class HrModule {}
