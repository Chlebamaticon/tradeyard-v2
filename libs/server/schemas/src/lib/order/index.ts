import * as zod from 'zod';

export const order = zod.object({
  order_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  offer_variant_price_id: zod.string().uuid(),
  quantity: zod.number(),
  contract_id: zod.string().uuid(),
  customer_id: zod.string().uuid(),
  customer_address: zod.string(),
  merchant_id: zod.string().uuid(),
  merchant_address: zod.string(),
});

export default {
  'order:created': order.required(),
  'order:snapshot': order.required(),
};
