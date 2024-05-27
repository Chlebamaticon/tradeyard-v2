import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  MerchantViewEntity,
} from '@tradeyard-v2/server/database';

import { UserModule } from '../users';

import { MerchantService } from './services';

@Module({
  imports: [
    UserModule,
    CommonDatabaseModule,
    TypeOrmModule.forFeature([MerchantViewEntity, EventEntity]),
  ],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
