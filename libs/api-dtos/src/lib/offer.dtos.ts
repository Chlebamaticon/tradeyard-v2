import * as zod from 'zod';
import { pagination, queryParams } from './pagination.dtos';

export const Offer = zod.object({
  offer_id: zod.string().uuid(),
  merchant_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
});
export type OfferDto = zod.infer<typeof Offer>;

export const GetOfferPathParams = zod
  .object({})
  .merge(Offer.pick({ offer_id: true }));
export const GetOffer = zod.object({}).merge(Offer);
export type GetOfferDto = zod.infer<typeof GetOffer>;
export type GetOfferPathParamsDto = zod.infer<typeof GetOfferPathParams>;

export const GetOffersQueryParams = queryParams({});
export const GetOffers = pagination(Offer);
export type GetOffersDto = zod.infer<typeof GetOffers>;
export type GetOffersQueryParamsDto = zod.infer<typeof GetOffersQueryParams>;

export const CreateOfferBody = zod.object({
  title: zod.string(),
  description: zod.string(),
});
export const CreateOffer = zod.object({}).merge(Offer);
export type CreateOfferDto = zod.infer<typeof CreateOffer>;
export type CreateOfferBodyDto = zod.infer<typeof CreateOfferBody>;

export const UpdateOfferBody = zod
  .object({
    offer_id: zod.string().uuid(),
  })
  .merge(Offer.pick({ title: true, description: true }).partial());
export const UpdateOfferPathParams = zod.object({
  offer_id: zod.string().uuid(),
});
export const UpdateOffer = zod.object({}).merge(Offer);
export type UpdateOfferDto = zod.infer<typeof UpdateOffer>;
export type UpdateOfferBodyDto = zod.infer<typeof UpdateOfferBody>;
export type UpdateOfferPathParamsDto = zod.infer<typeof UpdateOfferPathParams>;
