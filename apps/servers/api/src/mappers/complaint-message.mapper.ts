import { ComplaintMessageDto } from '@tradeyard-v2/api-dtos';
import { ComplaintMessageViewEntity } from '@tradeyard-v2/server/database';

import { mapToBasicUserDto } from './user.mapper';

export function mapToComplaintMessageDto(
  message: ComplaintMessageViewEntity & { recipient_id?: string }
): ComplaintMessageDto {
  return {
    complaint_message_id: message.complaint_message_id,
    complaint_id: message.complaint_id,
    user_id: message.user_id,
    user: message.user ? mapToBasicUserDto(message.user) : undefined,
    body: message.body,
    sent_at: message.sent_at,
    created_at: message.created_at,
    own: message.recipient_id === message.user_id,
  };
}
