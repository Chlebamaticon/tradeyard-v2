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

import { OfferVariantService } from './offer-variant.service';
import { OfferService } from './offers.service';

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
