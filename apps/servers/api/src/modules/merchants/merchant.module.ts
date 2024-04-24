import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  MerchantViewEntity,
} from '@tradeyard-v2/server/database';

import { MerchantService } from './merchant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantViewEntity, EventEntity]),
    CommonDatabaseModule,
  ],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
