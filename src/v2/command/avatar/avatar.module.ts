import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvatarService } from './avatar.service';
import { AvatarCommand } from './avatar.command';
import { MezonModule } from 'src/v2/mezon/mezon.module';

@Module({
  imports: [PrismaModule, MezonModule],
  providers: [AvatarService, AvatarCommand],
  exports: [AvatarService, AvatarCommand],
})
export class AvatarModule {}
