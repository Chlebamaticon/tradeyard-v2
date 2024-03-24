import { createPublicClient, webSocket } from 'viem';
import { polygonMumbai } from 'viem/chains';

export const AlchemyPublicClient = Symbol('alchemy:public:client');

export default {
  provide: AlchemyPublicClient,
  useFactory: () =>
    createPublicClient({
      chain: polygonMumbai,
      transport: webSocket(
        'wss://eth-mainnet.g.alchemy.com/v2/PzF4U1lkQgntAN2AmXsI00Ul-e0t-MPZ',
        { key: 'alchemy' }
      ),
    }),
};
