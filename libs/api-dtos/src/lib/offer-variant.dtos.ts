import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';
import { Token } from './token.dtos';

export const TokenSymbol = zod.enum(['USD', 'EUR', 'GBP', 'MATIC']);

const OfferVariantPrice = zod.object({
  amount: zod.number(),
  token: Token,
});

export const OfferVariant = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
  current_price: OfferVariantPrice,
});
export type OfferVariantDto = zod.infer<typeof OfferVariant>;

export const GetOfferVariantPathParams = zod
  .object({})
  .merge(OfferVariant.pick({ offer_id: true, offer_variant_id: true }));
export const GetOfferVariant = zod.object({}).merge(OfferVariant);
export type GetOfferVariantDto = zod.infer<typeof GetOfferVariant>;
export type GetOfferVariantPathParamsDto = zod.infer<
  typeof GetOfferVariantPathParams
>;

export const GetOfferVariantsPathParams = zod
  .object({})
  .merge(OfferVariant.pick({ offer_id: true }));
export const GetOfferVariantsQueryParams = queryParams({});
export const GetOfferVariants = pagination(OfferVariant);
export type GetOfferVariantsDto = zod.infer<typeof GetOfferVariants>;
export type GetOfferVariantsPathParamsDto = zod.infer<
  typeof GetOfferVariantsPathParams
>;
export type GetOfferVariantsQueryParamsDto = zod.infer<
  typeof GetOfferVariantsQueryParams
>;

export const CreateOfferVariantBody = zod.object({
  offer_id: zod.string().uuid(),
  price: OfferVariantPrice.extend({ token: TokenSymbol }),
  title: zod.string(),
  description: zod.string(),
});
export const CreateOfferVariant = zod.object({}).merge(OfferVariant);
export type CreateOfferVariantDto = zod.infer<typeof CreateOfferVariant>;
export type CreateOfferVariantBodyDto = zod.infer<
  typeof CreateOfferVariantBody
>;

export const UpdateOfferVariantBody = zod
  .object({
    offer_id: zod.string().uuid(),
    offer_variant_id: zod.string().uuid(),
  })
  .merge(OfferVariant.pick({ title: true, description: true }).partial());
export const UpdateOfferVariantPathParams = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
});
export const UpdateOfferVariant = zod.object({}).merge(OfferVariant);
export type UpdateOfferVariantDto = zod.infer<typeof UpdateOfferVariant>;
export type UpdateOfferVariantBodyDto = zod.infer<
  typeof UpdateOfferVariantBody
>;
export type UpdateOfferVariantPathParamsDto = zod.infer<
  typeof UpdateOfferVariantPathParams
>;
