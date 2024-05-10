import { ModeratorDto } from '@tradeyard-v2/api-dtos';
import { ModeratorViewEntity } from '@tradeyard-v2/server/database';

export function mapToModeratorDto(
  moderator: ModeratorViewEntity
): ModeratorDto {
  return {
    moderator_id: moderator.moderator_id,
    user_id: moderator.user_id,
    first_name: moderator.user.first_name,
    last_name: moderator.user.last_name,
    email: moderator.user.email,
  };
}
