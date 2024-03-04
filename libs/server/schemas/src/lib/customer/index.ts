import * as zod from 'zod';

export const customer = zod.object({
  customer_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
});

export default {
  'customer:created': customer.required(),
  'customer:updated': customer.required(),
  'customer:snapshot': customer.required(),
};
