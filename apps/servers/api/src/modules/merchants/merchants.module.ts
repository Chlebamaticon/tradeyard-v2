import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  MerchantViewEntity,
} from '@tradeyard-v2/server/database';

import { MerchantsService } from './merchants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantViewEntity, EventEntity]),
    CommonDatabaseModule,
  ],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
