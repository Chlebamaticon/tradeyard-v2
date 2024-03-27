import * as zod from 'zod';

export const offerVariantPrice = zod.object({
  offer_variant_id: zod.string().uuid(),
  offer_variant_price_id: zod.string().uuid(),
  token_id: zod.string().uuid(),
  amount: zod.string().regex(/[1-9]{1}[0-9]+/),
});

export default {
  'offer:variant:price:created': offerVariantPrice.required(),
  'offer:variant:price:updated': offerVariantPrice.required(),
  'offer:variant:price:snapshot': offerVariantPrice.required(),
};
