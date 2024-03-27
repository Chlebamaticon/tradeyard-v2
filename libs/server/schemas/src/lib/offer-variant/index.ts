import * as zod from 'zod';

export const offerVariant = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
});

export default {
  'offer:variant:created': offerVariant.required(),
  'offer:variant:updated': offerVariant.required(),
  'offer:variant:snapshot': offerVariant.required(),
};
