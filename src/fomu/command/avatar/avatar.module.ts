import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvatarService } from './avatar.service';
import { AvatarCommand } from './avatar.command';

@Module({
  imports: [PrismaModule],
  providers: [AvatarService, AvatarCommand],
  exports: [AvatarService, AvatarCommand],
})
export class AvatarModule {}
