import * as zod from 'zod';

import { HASH_REGEX } from '../regex';

export const token = zod.object({
  token_id: zod.string().uuid(),
  token_address: zod.string().regex(HASH_REGEX),
  symbol: zod.string(),
  name: zod.string(),
  precision: zod.number().int().positive(),
});

export default {
  'token:created': token.strict(),
  'token:updated': token.partial().required({ token_id: true }),
  'token:snapshot': token.strict().extend({ version: zod.number() }),
};
