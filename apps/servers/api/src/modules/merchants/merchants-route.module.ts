import { Module } from '@nestjs/common';

import { MerchantsController } from './merchants.controller';
import { MerchantModule } from './merchant.module';

@Module({
  imports: [MerchantModule],
  controllers: [MerchantsController],
})
export class MerchantsRouteModule {}
