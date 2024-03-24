import { Provider } from '@nestjs/common';
import { createWalletClient, WalletClient, webSocket } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { polygonMumbai } from 'viem/chains';

export const AlchemyWalletClient = Symbol('alchemy:wallet:client');

export default {
  provide: AlchemyWalletClient,
  useFactory: () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    console.log({
      publicKey: account.address,
      privateKey: privateKey,
    });
    return createWalletClient({
      chain: polygonMumbai,
      transport: webSocket(
        'wss://eth-mainnet.g.alchemy.com/v2/PzF4U1lkQgntAN2AmXsI00Ul-e0t-MPZ',
        { key: 'alchemy' }
      ),
      account,
    });
  },
} satisfies Provider<WalletClient>;
