import { Module } from '@nestjs/common';
import { MezonModule } from './mezon/mezon.module';
import { AvatarModule } from './command/avatar/avatar.module';

@Module({
  imports: [MezonModule, AvatarModule],
  exports: [MezonModule],
})
export class MainV2Module {}
