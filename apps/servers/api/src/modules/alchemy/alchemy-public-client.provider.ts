import { createPublicClient, webSocket } from 'viem';
import { polygonAmoy } from 'viem/chains';

export const AlchemyPublicClient = Symbol('alchemy:public:client');

export default {
  provide: AlchemyPublicClient,
  useFactory: () =>
    createPublicClient({
      chain: polygonAmoy,
      transport: webSocket(
        'wss://polygon-amoy.g.alchemy.com/v2/8nlrybVrAAt__SLRBss75r_CyA8WRhDc',
        { key: 'alchemy' }
      ),
    }),
};
