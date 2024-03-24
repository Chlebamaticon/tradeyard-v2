import * as zod from 'zod';
import { pagination, queryParams } from './pagination.dtos';
import { User } from './user.dtos';

export const Moderator = zod
  .object({
    moderator_id: zod.string().uuid(),
  })
  .merge(User);
export type ModeratorDto = zod.infer<typeof Moderator>;

export const GetModeratorPathParams = zod
  .object({})
  .merge(Moderator.pick({ moderator_id: true }));
export const GetModerator = zod.object({}).merge(Moderator);
export type GetModeratorDto = zod.infer<typeof GetModerator>;
export type GetModeratorPathParamsDto = zod.infer<
  typeof GetModeratorPathParams
>;

export const GetModeratorsQueryParams = queryParams({});
export const GetModerators = pagination(Moderator);
export type GetModeratorsDto = zod.infer<typeof GetModerators>;
export type GetModeratorsQueryParamsDto = zod.infer<
  typeof GetModeratorsQueryParams
>;

export const CreateModeratorBody = zod.object({
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});
export const CreateModerator = zod.object({}).merge(Moderator);
export type CreateModeratorDto = zod.infer<typeof CreateModerator>;
export type CreateModeratorBodyDto = zod.infer<typeof CreateModeratorBody>;

export const UpdateModeratorBody = zod
  .object({
    moderator_id: zod.string().uuid(),
  })
  .merge(
    Moderator.pick({ first_name: true, last_name: true, email: true }).partial()
  );
export const UpdateModeratorPathParams = zod.object({
  moderator_id: zod.string().uuid(),
});
export const UpdateModerator = zod.object({}).merge(Moderator);
export type UpdateModeratorDto = zod.infer<typeof UpdateModerator>;
export type UpdateModeratorBodyDto = zod.infer<typeof UpdateModeratorBody>;
export type UpdateModeratorPathParamsDto = zod.infer<
  typeof UpdateModeratorPathParams
>;
