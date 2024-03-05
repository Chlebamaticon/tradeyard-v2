import * as zod from 'zod';

export const GetOffer = zod.object({});

export const GetOffers = zod.object({
  items: zod.array(GetOffer),
});
