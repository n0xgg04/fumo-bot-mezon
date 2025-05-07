import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MezonModule } from './mezon/mezon.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BotModule } from './bot/bot.module';
import { FomuModule } from './fomu/fomu.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MEZON_TOKEN: Joi.string().required(),
      }),
    }),
    MezonModule.forRootAsync({
      imports: [ConfigModule],
    }),
    EventEmitterModule.forRoot(),
    MezonModule,
    BotModule,
    FomuModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        ttl: 60 * 60,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
