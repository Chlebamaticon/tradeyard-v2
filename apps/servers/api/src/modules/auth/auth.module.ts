import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  UserCredentialViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

import { CustomerModule } from '../customers';
import { MerchantModule } from '../merchants';
import { ModeratorModule } from '../moderators';
import { UserCredentialModule, UserModule, UserWalletModule } from '../users';

import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserViewEntity, UserCredentialViewEntity]),
    CommonDatabaseModule,
    UserModule,
    UserCredentialModule,
    CustomerModule,
    MerchantModule,
    ModeratorModule,
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService, LocalStrategy],
})
export class AuthModule {}
