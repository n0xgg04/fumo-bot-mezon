import { ChromeModule } from 'src/db/chroma/chrome.module';
import { HrService } from './hr.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HrCommand } from './hr.command';
import { MezonModule } from 'src/mezon/mezon.module';
import { QdrantClient } from '@qdrant/js-client-rest';

@Module({
  imports: [ChromeModule, ConfigModule, MezonModule],
  providers: [
    HrService,
    HrCommand,
    {
      provide: 'QRANDT_CLIENT',
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get('QRANDT_API_KEY');
        const url = configService.get('QRANDT_API_URL');

        if (!apiKey || !url) {
          throw new Error(
            'QRANDT_API_KEY and QRANDT_API_URL must be set in environment variables',
          );
        }

        return new QdrantClient({
          url,
          apiKey,
          timeout: 10000,
          headers: {
            'api-key': apiKey,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [HrService],
})
export class HrModule {}
