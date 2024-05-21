import * as zod from 'zod';

export const UserCustodialWallet = zod.object({
  type: zod.literal('custodial'),
  address: zod.string(),
});

export const UserTurnkeyWallet = zod.object({
  type: zod.literal('turnkey'),
  address: zod.string(),
  sub_organization_id: zod.string(),
});

export const UserWallet = zod
  .object({
    user_wallet_id: zod.string().uuid(),
    user_id: zod.string().uuid(),
    chain: zod.string(),
  })
  .and(UserCustodialWallet.or(UserTurnkeyWallet));

export default {
  'user:wallet:created': UserWallet,
};
