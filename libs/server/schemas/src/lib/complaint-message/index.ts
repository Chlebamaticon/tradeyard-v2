import * as zod from 'zod';

export const complaintMessage = zod.object({
  complaint_id: zod.string().uuid(),
  complaint_message_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  sent_at: zod.date(),
  body: zod.string(),
});

export default {
  'complaint:message:created': complaintMessage,
};
