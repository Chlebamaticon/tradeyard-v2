import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';

export const Order = zod.object({
  order_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  offer_variant_price_id: zod.string().uuid(),
  merchant_id: zod.string().uuid(),
  customer_id: zod.string().uuid(),
  quantity: zod.number(),
});
export type OrderDto = zod.infer<typeof Order>;

export const GetOrderPathParams = zod
  .object({})
  .merge(Order.pick({ order_id: true }))
  .required();
export const GetOrder = zod.object({}).merge(Order);
export type GetOrderDto = zod.infer<typeof GetOrder>;
export type GetOrderPathParamsDto = zod.infer<typeof GetOrderPathParams>;

export const GetOrdersQueryParams = queryParams({});
export const GetOrders = pagination(Order);
export type GetOrdersDto = zod.infer<typeof GetOrders>;
export type GetOrdersQueryParamsDto = zod.infer<typeof GetOrdersQueryParams>;

export const CreateOrderBody = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
});
export type CreateOrderBodyDto = zod.infer<typeof CreateOrderBody>;
export const CreateOrder = zod.object({}).merge(Order);
export type CreateOrderDto = zod.infer<typeof CreateOrder>;
