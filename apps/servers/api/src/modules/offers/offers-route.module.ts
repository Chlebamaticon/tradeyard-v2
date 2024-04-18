import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  OfferVariantPriceViewEntity,
  OfferVariantViewEntity,
  OfferViewEntity,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

import { OffersController } from './offers.controller';
import { OffersModule } from './offers.module';

@Module({
  imports: [OffersModule],
  controllers: [OffersController],
})
export class OffersRouteModule {}
