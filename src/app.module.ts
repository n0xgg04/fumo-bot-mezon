import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MezonModule } from './mezon/mezon.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BotModule } from './bot/bot.module';
import { FomuModule } from './fomu/fomu.module';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MEZON_TOKEN: Joi.string().required(),
      }),
    }),
    RedisModule,
    MezonModule.forRootAsync({
      imports: [ConfigModule],
    }),
    EventEmitterModule.forRoot(),
    MezonModule,
    BotModule,
    FomuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
