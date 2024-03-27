import { Module } from '@nestjs/common';

import AlchemyPublicClient from './alchemy-public-client.provider';
import AlchemyWalletClient from './alchemy-wallet-client.provider';

@Module({
  providers: [AlchemyPublicClient, AlchemyWalletClient],
  exports: [AlchemyPublicClient, AlchemyWalletClient],
})
export class AlchemyModule {}
