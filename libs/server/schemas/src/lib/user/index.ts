import * as zod from 'zod';

export const user = zod.object({
  user_id: zod.string().uuid(),
  first_name: zod.string(),
  last_name: zod.string(),
  email: zod.string().email(),
});

export default {
  'user:created': user.strict(),
  'user:updated': user.partial().required({ user_id: true }),
  'user:snapshot': user.strict().extend({ version: zod.number() }),
};
