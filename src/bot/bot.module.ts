import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { MezonModule } from 'src/mezon/mezon.module';
@Module({
  imports: [MezonModule],
  providers: [BotGateway],
  exports: [BotGateway],
})
export class BotModule {}
