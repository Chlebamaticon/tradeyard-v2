import { Provider } from '@nestjs/common';
import { createWalletClient, WalletClient, webSocket } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';

export const AlchemyWalletClient = Symbol('alchemy:wallet:client');

export default {
  provide: AlchemyWalletClient,
  useFactory: () => {
    const privateKey =
      (process.env['POLYGON_PRIVATE_KEY'] as `0x${string}`) ??
      generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    return createWalletClient({
      chain: polygonAmoy,
      transport: webSocket(
        'wss://polygon-amoy.g.alchemy.com/v2/8nlrybVrAAt__SLRBss75r_CyA8WRhDc',
        { key: 'alchemy' }
      ),
      account,
    });
  },
} satisfies Provider<WalletClient>;
