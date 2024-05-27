import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

import { UserService } from './services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserViewEntity]), CommonDatabaseModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
