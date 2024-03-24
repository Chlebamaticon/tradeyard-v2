import * as zod from 'zod';

export const Chain = zod.enum(['eth']);

export const Contract = zod.object({
  contract_id: zod.string().uuid(),
  address: zod.string(),
  chain: Chain,
});
