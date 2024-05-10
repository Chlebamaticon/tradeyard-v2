import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  ModeratorViewEntity,
} from '@tradeyard-v2/server/database';

import { ModeratorService } from './moderator.service';

@Module({
  imports: [
    CommonDatabaseModule,
    TypeOrmModule.forFeature([ModeratorViewEntity]),
  ],
  providers: [ModeratorService],
  exports: [ModeratorService],
})
export class ModeratorModule {}
