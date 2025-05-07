import { Module } from '@nestjs/common';
import { BotGateway } from './bot.gateway';
import { MezonModule } from 'src/mezon/mezon.module';
import { RedisModule } from 'src/core/redis/redis.module';
@Module({
  imports: [MezonModule, RedisModule],
  providers: [BotGateway],
  exports: [BotGateway],
})
export class BotModule {}
