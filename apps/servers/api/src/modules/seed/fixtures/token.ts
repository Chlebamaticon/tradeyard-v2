import { randomUUID } from 'crypto';

import { EventEntity } from '@tradeyard-v2/server/database';

import { createSeed } from '../seed.factory';

export const [TokenSeed, TokenSeedProvider] = createSeed(async (manager) => {
  const repository = manager.getRepository(EventEntity);
  return await repository.save([
    {
      type: 'token:created',
      body: {
        token_id: randomUUID(),
        symbol: 'MATIC',
        name: 'Polygon',
        precision: 18,
      },
    },
  ]);
});
