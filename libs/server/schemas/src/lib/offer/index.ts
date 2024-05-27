import * as zod from 'zod';

export const offer = zod.object({
  offer_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
  merchant_id: zod.string().uuid(),
});

export default {
  'offer:created': offer.required(),
  'offer:updated': offer
    .pick({ title: true, description: true, offer_id: true })
    .partial({ title: true, description: true })
    .required({ offer_id: true }),
  'offer:snapshot': offer.required(),
};
