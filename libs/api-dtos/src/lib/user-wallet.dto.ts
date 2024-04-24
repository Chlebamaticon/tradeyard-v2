import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';

export const userWallet = zod.object({
  user_id: zod.string().uuid(),
  address: zod.string(),
  chain: zod.string(),
  type: zod.enum(['turnkey', 'custodial']),
});
export type UserWalletDto = zod.infer<typeof userWallet>;

export const CreateUserWalletBody = zod
  .object({})
  .merge(userWallet.omit({ user_id: true }));
export const CreateUserWallet = zod.object({}).merge(userWallet);
export type CreateUserWalletDto = zod.infer<typeof CreateUserWallet>;
export type CreateUserWalletBodyDto = zod.infer<typeof CreateUserWalletBody>;

export const GetUserWallets = pagination(userWallet);
export const GetUserWalletsQueryParams = queryParams({});
export type GetUserWalletsDto = zod.infer<typeof GetUserWallets>;
export type GetUserWalletsQueryParamsDto = zod.infer<
  typeof GetUserWalletsQueryParams
>;
