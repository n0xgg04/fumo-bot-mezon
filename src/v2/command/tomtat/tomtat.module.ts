import { Module } from '@nestjs/common';
import { TomTatCommand } from './tomtat.command';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TomTatService } from './tomtat.service';
import { AiModule } from 'src/v2/ai/ai.module';
import { MezonModule } from 'src/v2/mezon/mezon.module';

@Module({
  imports: [PrismaModule, AiModule, MezonModule],
  providers: [TomTatService, TomTatCommand],
  exports: [TomTatService, TomTatCommand],
})
export class TomTatModule {}
