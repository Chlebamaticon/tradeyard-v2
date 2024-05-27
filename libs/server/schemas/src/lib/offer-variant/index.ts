import * as zod from 'zod';

export const offerVariant = zod.object({
  offer_id: zod.string().uuid(),
  offer_variant_id: zod.string().uuid(),
  title: zod.string().optional(),
  description: zod.string().optional(),
  archived: zod.boolean().optional(),
});

export default {
  'offer:variant:created': offerVariant.required({
    offer_id: true,
    offer_variant_id: true,
  }),
  'offer:variant:updated': offerVariant
    .omit({ offer_id: true })
    .required({ offer_variant_id: true }),
  'offer:variant:snapshot': offerVariant.required(),
};
