import * as zod from 'zod';

export const merchant = zod.object({
  merchant_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
});

export default {
  'merchant:created': merchant.strict(),
  'merchant:updated': merchant
    .omit({ user_id: true })
    .partial()
    .required({ merchant_id: true }),
  'merchant:snapshot': merchant.strict().extend({ version: zod.number() }),
};
