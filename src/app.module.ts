import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { MezonModule } from './mezon/mezon.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './core/redis/redis.module';
import { MainV2Module } from './v2/main.module';
import { BotModule } from './v2/bot/bot.module';
import { AiModule } from './v2/ai/ai.module';
import { DailyModule } from './v2/command/daily/daily.module';
import { TomTatModule } from './v2/command/tomtat/tomtat.module';
import { TopupModule } from './v2/command/topup/topup.module';
import { WorksModule } from './v2/command/works/works.module';
import { XsModule } from './v2/command/xs/xs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MEZON_TOKEN: Joi.string().required(),
      }),
    }),
    RedisModule,
    EventEmitterModule.forRoot(),
    MainV2Module,
    BotModule,
    AiModule,
    DailyModule,
    TomTatModule,
    TopupModule,
    WorksModule,
    XsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
