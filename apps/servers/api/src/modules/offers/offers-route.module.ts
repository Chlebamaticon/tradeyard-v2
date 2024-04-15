import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  OfferViewEntity,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfferViewEntity, TokenViewEntity, EventEntity]),
    CommonDatabaseModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersRouteModule {}
