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
import { OffersService } from './offers.service';

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
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
