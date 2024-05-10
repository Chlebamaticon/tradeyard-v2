import { Complaint, ComplaintDto } from '@tradeyard-v2/api-dtos';
import { ComplaintViewEntity } from '@tradeyard-v2/server/database';

import { mapToComplaintMessageDto } from './complaint-message.mapper';

export function mapToComplaintDto(
  complaint: ComplaintViewEntity & { recipient_id?: string }
): ComplaintDto {
  return Complaint.parse({
    complaint_id: complaint.complaint_id,
    order_id: complaint.order_id,
    user_id: complaint.user_id,
    messages: complaint.messages
      ? complaint.messages.map(mapToComplaintMessageDto)
      : undefined,
  });
}
