import { BasicUserDto } from '@tradeyard-v2/api-dtos';
import { UserViewEntity } from '@tradeyard-v2/server/database';

export function mapToBasicUserDto(user: UserViewEntity): BasicUserDto {
  return {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}
