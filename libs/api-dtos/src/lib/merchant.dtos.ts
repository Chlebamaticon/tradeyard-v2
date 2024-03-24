import * as zod from 'zod';
import { pagination, queryParams } from './pagination.dtos';
import { User } from './user.dtos';

export const Merchant = zod
  .object({
    merchant_id: zod.string().uuid(),
  })
  .merge(User);
export type MerchantDto = zod.infer<typeof Merchant>;

export const GetMerchantPathParams = zod
  .object({})
  .merge(Merchant.pick({ merchant_id: true }));
export const GetMerchant = zod.object({}).merge(Merchant);
export type GetMerchantDto = zod.infer<typeof GetMerchant>;
export type GetMerchantPathParamsDto = zod.infer<typeof GetMerchantPathParams>;

export const GetMerchantsQueryParams = queryParams({});
export const GetMerchants = pagination(Merchant);
export type GetMerchantsDto = zod.infer<typeof GetMerchants>;
export type GetMerchantsQueryParamsDto = zod.infer<
  typeof GetMerchantsQueryParams
>;

export const CreateMerchantBody = zod.object({
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});
export const CreateMerchant = zod.object({}).merge(Merchant);
export type CreateMerchantDto = zod.infer<typeof CreateMerchant>;
export type CreateMerchantBodyDto = zod.infer<typeof CreateMerchantBody>;

export const UpdateMerchantBody = zod
  .object({
    merchant_id: zod.string().uuid(),
  })
  .merge(
    Merchant.pick({ first_name: true, last_name: true, email: true }).partial()
  );
export const UpdateMerchantPathParams = zod.object({
  merchant_id: zod.string().uuid(),
});
export const UpdateMerchant = zod.object({}).merge(Merchant);
export type UpdateMerchantDto = zod.infer<typeof UpdateMerchant>;
export type UpdateMerchantBodyDto = zod.infer<typeof UpdateMerchantBody>;
export type UpdateMerchantPathParamsDto = zod.infer<
  typeof UpdateMerchantPathParams
>;
