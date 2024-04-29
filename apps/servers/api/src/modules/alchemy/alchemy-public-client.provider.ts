import { createPublicClient } from 'viem';

import { currentChain, transports } from '@tradeyard-v2/api-dtos';

export const AlchemyPublicClient = Symbol('alchemy:public:client');

export default {
  provide: AlchemyPublicClient,
  useFactory: () =>
    createPublicClient({
      chain: currentChain,
      transport: transports[currentChain.id].https,
    }),
};
