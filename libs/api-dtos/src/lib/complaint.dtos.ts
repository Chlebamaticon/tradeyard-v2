import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';
import { BasicUser } from './user.dtos';

export const ComplaintMessage = zod.object({
  complaint_id: zod.string().uuid(),
  complaint_message_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  user: BasicUser.optional(),
  body: zod.string(),
  own: zod.boolean(),
  sent_at: zod.date(),
  created_at: zod.date(),
});
export type ComplaintMessageDto = zod.infer<typeof ComplaintMessage>;

export const Complaint = zod.object({
  complaint_id: zod.string().uuid(),
  order_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  messages: zod.array(ComplaintMessage).optional(),
});
export type ComplaintDto = zod.infer<typeof Complaint>;

export const CreateComplaintBody = zod
  .object({})
  .merge(Complaint.pick({ order_id: true }))
  .merge(ComplaintMessage.pick({ body: true, sent_at: true }))
  .transform((dto) => ({ ...dto, sent_at: new Date(dto.sent_at) }));
export type CreateComplaintBodyDto = zod.infer<typeof CreateComplaintBody>;
export const CreateComplaint = zod.object({}).merge(Complaint);
export type CreateComplaintDto = zod.infer<typeof CreateComplaint>;

export const CreateComplaintMessageBody = zod
  .object({})
  .merge(ComplaintMessage.pick({ sent_at: true, body: true }));
export type CreateComplaintMessageBodyDto = zod.infer<
  typeof CreateComplaintMessageBody
>;

export const CreateComplaintMessage = zod.object({}).merge(ComplaintMessage);
export type CreateComplaintMessageDto = zod.infer<
  typeof CreateComplaintMessage
>;

export const UpdateComplaintBody = zod.object({
  decision: zod.enum(['refunded', 'released', 'rejected']),
});
export type UpdateComplaintBodyDto = zod.infer<typeof UpdateComplaintBody>;
export const UpdateComplaint = zod.object({}).merge(Complaint);
export type UpdateComplaintDto = zod.infer<typeof UpdateComplaint>;

export const GetComplaint = zod.object({}).merge(Complaint);
export type GetComplaintDto = zod.infer<typeof GetComplaint>;
export const GetComplaintParams = zod
  .object({})
  .merge(Complaint.pick({ complaint_id: true }));
export type GetComplaintParamsDto = zod.infer<typeof GetComplaintParams>;

export const GetComplaints = pagination(Complaint);
export type GetComplaintsDto = zod.infer<typeof GetComplaints>;
export const GetComplaintsParams = zod
  .object({})
  .merge(Complaint.pick({ complaint_id: true }));
export type GetComplaintsParamsDto = zod.infer<typeof GetComplaintsParams>;
export const GetComplaintsQueryParams = queryParams({});
export type GetComplaintsQueryParamsDto = zod.infer<
  typeof GetComplaintsQueryParams
>;

export const GetComplaintMessage = zod.object({}).merge(ComplaintMessage);
export type GetComplaintMessageDto = zod.infer<typeof GetComplaintMessage>;

export const GetComplaintMessagesParams = zod.object({
  complaint_id: zod.string().uuid(),
});
export const GetComplaintMessagesQueryParams = queryParams({});
export type GetComplaintMessagesParamsDto = zod.infer<
  typeof GetComplaintMessagesParams
>;
export type GetComplaintMessagesQueryParamsDto = zod.infer<
  typeof GetComplaintMessagesQueryParams
>;
export const GetComplaintMessages = pagination(ComplaintMessage);
export type GetComplaintMessagesDto = zod.infer<typeof GetComplaintMessages>;
