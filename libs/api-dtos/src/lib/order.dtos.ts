import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';
import { Wallet } from './wallet.dtos';

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

export const GetOrders = pagination(Order);
export const GetOrdersParams = zod.object({
  merchant_id: zod.string().uuid().optional(),
  customer_id: zod.string().uuid().optional(),
});
export const GetOrdersQueryParams = queryParams({});
export type GetOrdersDto = zod.infer<typeof GetOrders>;
export type GetOrdersParamsDto = zod.infer<typeof GetOrdersParams>;
export type GetOrdersQueryParamsDto = zod.infer<typeof GetOrdersQueryParams>;

export const CreateOrderBody = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  quantity: zod.number().positive().min(1),
  customer: Wallet,
});
export type CreateOrderBodyDto = zod.infer<typeof CreateOrderBody>;
export const CreateOrder = zod.object({}).merge(Order);
export type CreateOrderDto = zod.infer<typeof CreateOrder>;
