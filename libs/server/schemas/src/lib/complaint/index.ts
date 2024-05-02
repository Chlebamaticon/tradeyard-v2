import * as zod from 'zod';

const complaintDecision = zod.object({
  moderator_id: zod.string().uuid(),
  status_at: zod.date(),
  status: zod.enum(['refunded', 'released', 'rejected']),
});

export type ComplaintDecision = zod.infer<typeof complaintDecision>;

export const complaint = zod.object({
  complaint_id: zod.string().uuid(),
  order_id: zod.string().uuid(),
  decision: complaintDecision.optional().nullable(),
});

export default {
  'complaint:created': complaint
    .omit({
      decision: true,
    })
    .merge(zod.object({ status: zod.enum(['open']) })),
  'complaint:decision:released': complaint
    .pick({
      complaint_id: true,
    })
    .merge(
      complaintDecision
        .omit({ status: true })
        .merge(zod.object({ status: zod.literal('released') }))
    ),
  'complaint:decision:refunded': complaint
    .pick({
      complaint_id: true,
    })
    .merge(
      complaintDecision
        .omit({ status: true })
        .merge(zod.object({ status: zod.literal('refunded') }))
    ),
  'complaint:decision:rejected': complaint
    .pick({ complaint_id: true })
    .merge(
      complaintDecision
        .omit({ status: true })
        .merge(zod.object({ status: zod.literal('rejected') }))
    ),
};
