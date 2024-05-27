import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  UserCredentialViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

import { UserCredentialService } from './services/user-credential.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserViewEntity, UserCredentialViewEntity]),
    CommonDatabaseModule,
  ],
  providers: [UserCredentialService],
  exports: [UserCredentialService],
})
export class UserCredentialModule {}
