import * as zod from 'zod';

import { Complaint } from './complaint.dtos';
import { Contract } from './contract.dtos';
import { Merchant } from './merchant.dtos';
import { OfferVariant, OfferVariantPrice } from './offer-variant.dtos';
import { Offer } from './offer.dtos';
import { pagination, queryParams } from './pagination.dtos';

export enum OrderStatus {
  Created,
  CustomerDeposit,
  CustomerRelease,
  CustomerComplaint,
  MerchantConfirmed,
  MerchantCancelled,
  MerchantShipping,
  MerchantShipped,
  MerchantRelease,
  MerchantComplaint,
  ModeratorComplaintReleased,
  ModeratorComplaintRefunded,
  Closed,
}

export const Order = zod.object({
  order_id: zod.string().uuid(),
  quantity: zod.number(),
  merchant: zod
    .object({})
    .merge(
      Merchant.pick({ merchant_id: true, first_name: true, last_name: true })
    ),
  contract: zod
    .object({})
    .merge(Contract.pick({ contract_id: true, address: true, chain: true })),
  offer: zod
    .object({})
    .merge(Offer.pick({ offer_id: true, title: true, description: true })),
  offer_variant: zod.object({}).merge(
    OfferVariant.pick({
      offer_variant_id: true,
      title: true,
      description: true,
    })
  ),
  offer_variant_price: zod.object({}).merge(
    OfferVariantPrice.pick({
      offer_variant_price_id: true,
      amount: true,
      token: true,
    })
  ),
  complaints: zod.array(Complaint),
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
  customer_address: zod.string(),
});
export type CreateOrderBodyDto = zod.infer<typeof CreateOrderBody>;
export const CreateOrder = zod.object({}).merge(Order);
export type CreateOrderDto = zod.infer<typeof CreateOrder>;
