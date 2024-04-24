import * as zod from 'zod';

const passwordCredential = zod.object({
  type: zod.literal('password'),
  salt: zod.string(),
  hash: zod.string(),
});

export const userCredential = zod
  .object({
    user_id: zod.string().uuid(),
    user_credential_id: zod.string().uuid(),
  })
  .merge(passwordCredential);

export default {
  'user:credential:created': userCredential.strict(),
  'user:credential:snapshot': userCredential
    .strict()
    .extend({ version: zod.number() }),
};
