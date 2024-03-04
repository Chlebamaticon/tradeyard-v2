import { version } from 'os';
import * as zod from 'zod';

export const schema = zod.object({
  moderator_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
});

export default {
  'moderator:created': schema.required().strict(),
  'moderator:updated': schema
    .partial()
    .required({ moderator_id: true })
    .omit({ user_id: true })
    .strict(),
  'moderator:snapshot': schema
    .required()
    .strict()
    .extend({ version: zod.number() }),
};
