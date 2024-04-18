import { Module } from '@nestjs/common';

import { MerchantsController } from './merchants.controller';
import { MerchantsModule } from './merchants.module';

@Module({
  imports: [MerchantsModule],
  controllers: [MerchantsController],
})
export class MerchantsRouteModule {}
