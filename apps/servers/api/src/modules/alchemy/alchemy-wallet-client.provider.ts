import { Provider } from '@nestjs/common';
import { createWalletClient, WalletClient, webSocket } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { polygonMumbai } from 'viem/chains';

export const AlchemyWalletClient = Symbol('alchemy:wallet:client');

export default {
  provide: AlchemyWalletClient,
  useFactory: () => {
    const privateKey =
      (process.env['POLYGON_PRIVATE_KEY'] as `0x${string}`) ??
      generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    return createWalletClient({
      chain: polygonMumbai,
      transport: webSocket(
        'wss://polygon-mainnet.g.alchemy.com/v2/QJcDPZfWnh6bvESljyKRwh7K4BpDv_Et',
        { key: 'alchemy' }
      ),
      account,
    });
  },
} satisfies Provider<WalletClient>;
