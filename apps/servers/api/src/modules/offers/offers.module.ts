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

import { OfferService, OfferVariantService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfferViewEntity,
      OfferVariantViewEntity,
      OfferVariantPriceViewEntity,
      TokenViewEntity,
      EventEntity,
    ]),
    CommonDatabaseModule,
  ],
  providers: [OfferService, OfferVariantService],
  exports: [OfferService, OfferVariantService],
})
export class OffersModule {}
