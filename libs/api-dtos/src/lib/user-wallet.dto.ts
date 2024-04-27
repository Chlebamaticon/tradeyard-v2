import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';

export const UserWallet = zod.object({
  user_wallet_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  address: zod.string(),
  chain: zod.string(),
  type: zod.enum(['turnkey', 'custodial']),
  created_at: zod.string().transform((val) => new Date(val).toUTCString()),
});
export type UserWalletDto = zod.infer<typeof UserWallet>;

export const CreateUserWalletBody = zod
  .object({})
  .merge(UserWallet.pick({ address: true, type: true, chain: true }));
export const CreateUserWallet = zod.object({}).merge(UserWallet);
export type CreateUserWalletDto = zod.infer<typeof CreateUserWallet>;
export type CreateUserWalletBodyDto = zod.infer<typeof CreateUserWalletBody>;

export const GetUserWallet = zod.object({}).merge(UserWallet);
export type GetUserWalletDto = zod.infer<typeof GetUserWallet>;

export const GetUserWallets = pagination(UserWallet);
export const GetUserWalletsQueryParams = queryParams({});
export type GetUserWalletsDto = zod.infer<typeof GetUserWallets>;
export type GetUserWalletsQueryParamsDto = zod.infer<
  typeof GetUserWalletsQueryParams
>;
