import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';
import { UserWallet } from './user-wallet.dto';

export const User = zod.object({
  user_id: zod.string().uuid(),
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});
export type UserDto = zod.infer<typeof User>;

export const BasicUser = User.pick({
  user_id: true,
  first_name: true,
  last_name: true,
});
export type BasicUserDto = zod.infer<typeof BasicUser>;

export const UserExtended = zod
  .object({
    customer_id: zod.string().uuid().optional().nullable(),
    moderator_id: zod.string().uuid().optional().nullable(),
    merchant_id: zod.string().uuid().optional().nullable(),
  })
  .merge(User);
export type UserExtendedDto = zod.infer<typeof UserExtended>;

export const GetWhoami = zod
  .object({
    wallets: zod.array(
      UserWallet.pick({ type: true, address: true, sub_organization_id: true })
    ),
  })
  .merge(UserExtended);
export type GetWhoamiDto = zod.infer<typeof GetWhoami>;

export const GetUserPathParams = zod
  .object({})
  .merge(User.pick({ user_id: true }));
export const GetUser = zod.object({}).merge(User);
export type GetUserDto = zod.infer<typeof GetUser>;
export type GetUserPathParamsDto = zod.infer<typeof GetUserPathParams>;

export const GetUsersQueryParams = queryParams({});
export const GetUsers = pagination(User);
export type GetUsersDto = zod.infer<typeof GetUsers>;
export type GetUsersQueryParamsDto = zod.infer<typeof GetUsersQueryParams>;

export const CreateUserBody = zod.object({
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});
export const CreateUser = zod.object({}).merge(User);
export type CreateUserDto = zod.infer<typeof CreateUser>;
export type CreateUserBodyDto = zod.infer<typeof CreateUserBody>;

export const UpdateUserBody = zod
  .object({
    user_id: zod.string().uuid(),
  })
  .merge(
    User.pick({ first_name: true, last_name: true, email: true }).partial()
  );
export const UpdateUserPathParams = zod.object({
  user_id: zod.string().uuid(),
});
export const UpdateUser = zod.object({}).merge(User);
export type UpdateUserDto = zod.infer<typeof UpdateUser>;
export type UpdateUserBodyDto = zod.infer<typeof UpdateUserBody>;
export type UpdateUserPathParamsDto = zod.infer<typeof UpdateUserPathParams>;
