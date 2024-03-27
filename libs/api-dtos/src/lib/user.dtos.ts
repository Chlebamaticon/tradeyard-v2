import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';

export const User = zod.object({
  user_id: zod.string().uuid(),
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});
export type UserDto = zod.infer<typeof User>;

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
