import * as zod from 'zod';

export const Wallet = zod.object({
  address: zod.string().regex(/^0x[a-f0-9]{40}$/i),
});
