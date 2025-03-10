import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  UserWalletViewEntity,
} from '@tradeyard-v2/server/database';

import { TurnkeyModule } from '../turnkey';

import { UserWalletService } from './services/user-wallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWalletViewEntity]),
    TurnkeyModule,
    CommonDatabaseModule,
  ],
  providers: [UserWalletService],
  exports: [UserWalletService],
})
export class UserWalletModule {}
