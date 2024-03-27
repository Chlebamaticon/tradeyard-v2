import * as zod from 'zod';

export const Order = zod.object({
  order_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  merchant_id: zod.string().uuid(),
});
export type OrderDto = zod.infer<typeof Order>;

export const GetOrderPathParams = zod
  .object({})
  .merge(Order.pick({ offer_variant_id: true }));
export const GetOrder = zod.object({}).merge(Order);
export type GetOrderDto = zod.infer<typeof GetOrder>;
export type GetOrderPathParamsDto = zod.infer<typeof GetOrderPathParams>;
