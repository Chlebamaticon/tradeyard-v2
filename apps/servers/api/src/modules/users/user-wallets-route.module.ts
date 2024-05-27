import { Module } from '@nestjs/common';

import { UserWalletController } from './controllers';
import { UserWalletModule } from './user-wallet.module';

@Module({
  imports: [UserWalletModule],
  controllers: [UserWalletController],
})
export class UserWalletsRouteModule {}
