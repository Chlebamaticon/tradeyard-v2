import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  CustomerViewEntity,
  EventEntity,
} from '@tradeyard-v2/server/database';

import { UserModule } from '../users';

import { CustomerService } from './customer.service';

@Module({
  imports: [
    UserModule,
    CommonDatabaseModule,
    TypeOrmModule.forFeature([CustomerViewEntity, EventEntity]),
  ],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
