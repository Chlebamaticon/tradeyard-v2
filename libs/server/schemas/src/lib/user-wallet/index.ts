import * as zod from 'zod';

export const UserWallet = zod.object({
  user_wallet_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  chain: zod.string(),
  address: zod.string(),
  type: zod.enum(['turnkey', 'custodial']),
});

export default {
  'user:wallet:created': UserWallet.strict(),
};
