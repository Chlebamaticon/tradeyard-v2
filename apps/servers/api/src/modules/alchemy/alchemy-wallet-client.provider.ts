import { Logger, Provider } from '@nestjs/common';
import {
  createWalletClient,
  formatEther,
  publicActions,
  PublicClient,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { currentChain, transports } from '@tradeyard-v2/api-dtos';

import { AlchemyPublicClient } from './alchemy-public-client.provider';

export const AlchemyWalletClient = Symbol('alchemy:wallet:client');

export default {
  provide: AlchemyWalletClient,
  useFactory: async (publicClient: PublicClient) => {
    const logger = new Logger('AlchemyWalletClient');
    const privateKey =
      (process.env['POLYGON_PRIVATE_KEY'] as `0x${string}`) ??
      generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      chain: currentChain,
      transport: transports[currentChain.id].https,
      account,
    });

    const balance = await publicClient.getBalance(account);
    logger.debug(
      `Using account "${account.address}" (${formatEther(balance)} ${
        client.chain.nativeCurrency.symbol
      }) as a wallet client.`,
      { privateKey }
    );
    return client.extend(publicActions);
  },
  inject: [AlchemyPublicClient],
};
