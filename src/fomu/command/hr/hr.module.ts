import { ChromeModule } from 'src/db/chroma/chrome.module';
import { HrService } from './hr.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HrCommand } from './hr.command';
import { MezonModule } from 'src/mezon/mezon.module';
import { QdrantModule } from 'src/db/qdrant/qdrant.module';

@Module({
  imports: [ChromeModule, ConfigModule, MezonModule, QdrantModule],
  providers: [HrService, HrCommand],
  exports: [HrService],
})
export class HrModule {}
