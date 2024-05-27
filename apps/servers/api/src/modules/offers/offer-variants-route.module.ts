import { Module } from '@nestjs/common';

import { OfferVariantsController } from './controllers';
import { OffersModule } from './offers.module';

@Module({
  imports: [OffersModule],
  controllers: [OfferVariantsController],
})
export class OfferVariantsRouteModule {}
