import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CustomerViewEntity,
  MerchantViewEntity,
  UserCredentialViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

import { JwtAuthGuard } from './guards';
import { JwtStrategy, LocalStrategy } from './strategies';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCredentialViewEntity,
      UserViewEntity,
      CustomerViewEntity,
      MerchantViewEntity,
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7 days' },
    }),
  ],
  providers: [
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthGuardModule {}
