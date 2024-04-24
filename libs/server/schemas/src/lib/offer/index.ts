import * as zod from 'zod';

export const offer = zod.object({
  offer_id: zod.string().uuid(),
  title: zod.string(),
  description: zod.string(),
  merchant_id: zod.string().uuid(),
});

export default {
  'offer:created': offer.required(),
  'offer:updated': offer.required(),
  'offer:snapshot': offer.required(),
};
