import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonDatabaseModule } from '@tradeyard-v2/server/database';

import { UserWalletService } from './user-wallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWalletService]),
    CommonDatabaseModule,
  ],
  providers: [UserWalletService],
  exports: [UserWalletService],
})
export class UserWalletModule {}
