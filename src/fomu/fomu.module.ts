import { Module } from '@nestjs/common';
import { MezonModule } from 'src/mezon/mezon.module';
import { FomuService } from './fomu.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FomuLogService } from './message_log/fomu.service';
import { TomTatModule } from './command/tomtat/tomtat.module';
import { AvatarModule } from './command/avatar/avatar.module';
import { DailyModule } from './command/daily/daily.module';
import { TopupModule } from './command/topup/topup.module';

@Module({
  imports: [
    MezonModule,
    PrismaModule,
    TomTatModule,
    AvatarModule,
    DailyModule,
    TopupModule,
  ],
  providers: [FomuService, FomuLogService],
  exports: [FomuService],
})
export class FomuModule {}
