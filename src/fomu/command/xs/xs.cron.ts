import { Injectable, Logger } from '@nestjs/common';
import { XsService } from './xs.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class XsCron {
  constructor(
    private readonly xsService: XsService,
    private readonly logger: Logger,
  ) {}

  @Cron('*/2 * * * *')
  async handleCron() {
    this.logger.log('CHECKING XSMB');
    await this.xsService.checkXs();
  }
}
