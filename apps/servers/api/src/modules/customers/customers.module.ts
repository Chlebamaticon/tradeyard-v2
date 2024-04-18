import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  CustomerViewEntity,
  EventEntity,
} from '@tradeyard-v2/server/database';

import { CustomersService } from './customers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerViewEntity, EventEntity]),
    CommonDatabaseModule,
  ],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
