import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  OrderViewEntity,
} from '@tradeyard-v2/server/database';

import { CustomerModule } from '../customers';
import { MerchantModule } from '../merchants';
import { OffersModule } from '../offers';
import { OrdersContractModule } from '../orders-contract';
import { UserWalletModule } from '../users';

import { OrderService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderViewEntity, EventEntity]),
    CommonDatabaseModule,
    MerchantModule,
    CustomerModule,
    OffersModule,
    OrdersContractModule,
    UserWalletModule,
  ],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
