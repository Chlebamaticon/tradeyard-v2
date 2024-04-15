import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CommonDatabaseModule,
  EventEntity,
  TokenViewEntity,
} from '@tradeyard-v2/server/database';

import { TokenService } from './token.service';
import { TokensController } from './tokens.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenViewEntity, EventEntity]),
    CommonDatabaseModule,
  ],
  controllers: [TokensController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokensRouteModule {}
