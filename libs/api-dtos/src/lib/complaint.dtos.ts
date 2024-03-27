import * as zod from 'zod';

import { Customer } from './customer.dtos';
import { Merchant } from './merchant.dtos';

export const Complaint = zod
  .object({
    complaint_id: zod.string().uuid(),
  })
  .merge(Customer.pick({ customer_id: true }))
  .merge(Merchant.pick({ merchant_id: true }));

export const GetComplaint = zod.object({}).merge(Complaint);
export type GetComplaintDto = zod.infer<typeof GetComplaint>;

export const GetComplaints = zod.object({}).merge(Complaint);
export type GetComplaintsDto = zod.infer<typeof GetComplaints>;
