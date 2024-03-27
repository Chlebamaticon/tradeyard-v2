import * as zod from 'zod';

export const offer = zod.object({
  offer_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
});

export const offerVariant = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
});

export default {
  'offer:created': offer.required(),
  'offer:updated': offer.required(),
  'offer:snapshot': offer.required(),
};
