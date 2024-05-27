import { Module } from '@nestjs/common';

import { MerchantsController } from './controllers';
import { MerchantModule } from './merchant.module';

@Module({
  imports: [MerchantModule],
  controllers: [MerchantsController],
})
export class MerchantsRouteModule {}
