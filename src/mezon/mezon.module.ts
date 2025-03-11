import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MezonService } from './mezon.service';
import { MessageQueueStore } from './message-queue-services/message-queue-store.service';
import { MessageQueueService } from './message-queue-services/message-queue.service';

@Global()
@Module({
  providers: [MessageQueueStore],
})
export class MezonModule {
  static forRootAsync(options: MezonModuleAsyncOptions): DynamicModule {
    return {
      module: MezonModule,
      imports: options.imports,
      providers: [
        {
          provide: MezonService,
          useFactory: async (configService: ConfigService) => {
            const clientConfig: MezonClientConfig = {
              token: configService.get<string>('MEZON_TOKEN') || '',
            };

            const client = new MezonService(clientConfig);

            await client.initializeClient();

            return client;
          },
          inject: [ConfigService],
        },
        {
          provide: MessageQueueService,
          useFactory: (
            client: MezonService,
            messageQueueStore: MessageQueueStore,
          ): MessageQueueService => {
            return new MessageQueueService(
              client,
              messageQueueStore,
            );
          },
          inject: [MezonService, MessageQueueStore],
        },
      ],
      exports: [MezonService, MessageQueueService, MessageQueueStore],
    };
  }
}
