import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupEvent } from './topup.event';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TopupService, TopupEvent],
  exports: [TopupService, TopupEvent],
})
export class TopupModule {}
