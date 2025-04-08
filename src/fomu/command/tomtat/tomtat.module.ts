import { Module } from '@nestjs/common';
import { TomTatCommand } from './tomtat.command';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TomTatService } from './tomtat.service';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  providers: [TomTatService, TomTatCommand],
  exports: [TomTatService, TomTatCommand],
})
export class TomTatModule {}
