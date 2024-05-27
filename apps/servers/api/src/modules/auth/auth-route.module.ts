import { Module } from '@nestjs/common';

import { UserWalletModule } from '../users';

import { AuthController } from './controllers/auth.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule, UserWalletModule],
  controllers: [AuthController],
})
export class AuthRouteModule {}
