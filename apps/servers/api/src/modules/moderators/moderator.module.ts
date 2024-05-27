import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  ModeratorViewEntity,
} from '@tradeyard-v2/server/database';

import { UserModule } from '../users';

import { ModeratorService } from './services';

@Module({
  imports: [
    UserModule,
    CommonDatabaseModule,
    TypeOrmModule.forFeature([ModeratorViewEntity]),
  ],
  providers: [ModeratorService],
  exports: [ModeratorService],
})
export class ModeratorModule {}
