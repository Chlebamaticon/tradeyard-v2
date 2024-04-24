import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  CustomerViewEntity,
  EventEntity,
} from '@tradeyard-v2/server/database';

import { CustomerService } from './customer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerViewEntity, EventEntity]),
    CommonDatabaseModule,
  ],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
