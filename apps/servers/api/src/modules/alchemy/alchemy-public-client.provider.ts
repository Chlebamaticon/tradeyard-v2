import { createPublicClient, webSocket } from 'viem';
import { polygonMumbai } from 'viem/chains';

export const AlchemyPublicClient = Symbol('alchemy:public:client');

export default {
  provide: AlchemyPublicClient,
  useFactory: () =>
    createPublicClient({
      chain: polygonMumbai,
      transport: webSocket(
        'wss://polygon-amoy.g.alchemy.com/v2/8nlrybVrAAt__SLRBss75r_CyA8WRhDc',
        { key: 'alchemy' }
      ),
    }),
};
