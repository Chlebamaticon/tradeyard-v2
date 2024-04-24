import { Module } from '@nestjs/common';

import { UserWalletController } from './user-wallet.controller';
import { UserWalletModule } from './user-wallet.module';

@Module({
  imports: [UserWalletModule],
  controllers: [UserWalletController],
})
export class UserWalletsRouteModule {}
