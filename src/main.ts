import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotGateway } from './bot/bot.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3123);

  const botGateway = app.get(BotGateway);
  botGateway.initEvent();
}
bootstrap();
