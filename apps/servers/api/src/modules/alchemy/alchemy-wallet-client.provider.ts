import { Logger, Provider } from '@nestjs/common';
import { createWalletClient, WalletClient, webSocket } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';

export const AlchemyWalletClient = Symbol('alchemy:wallet:client');

export default {
  provide: AlchemyWalletClient,
  useFactory: () => {
    const logger = new Logger('AlchemyWalletClient');
    const privateKey =
      (process.env['POLYGON_PRIVATE_KEY'] as `0x${string}`) ??
      generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    logger.debug(`Using account ${account.address} for wallet client`);
    return createWalletClient({
      chain: polygonAmoy,
      transport: webSocket(
        'wss://polygon-amoy.g.alchemy.com/v2/3qRz7cWG_qr34OFx7kyfYz79Htsm2inC',
        { key: 'alchemy' }
      ),
      account,
    });
  },
  inject: [],
} satisfies Provider<WalletClient>;
