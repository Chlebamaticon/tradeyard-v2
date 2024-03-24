import { version } from 'os';
import * as zod from 'zod';

export const moderator = zod.object({
  moderator_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
});

export default {
  'moderator:created': moderator.required().strict(),
  'moderator:updated': moderator
    .partial()
    .required({ moderator_id: true })
    .omit({ user_id: true })
    .strict(),
  'moderator:snapshot': moderator
    .required()
    .strict()
    .extend({ version: zod.number() }),
};
