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

import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderViewEntity, EventEntity]),
    CommonDatabaseModule,
    MerchantModule,
    CustomerModule,
    OffersModule,
    OrdersContractModule,
  ],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
