import * as zod from 'zod';

export const Contract = zod.object({
  contract_id: zod.string().uuid(),
  address: zod.string(),
  chain: zod.string(),
});
