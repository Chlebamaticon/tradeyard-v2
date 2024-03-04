import * as zod from 'zod';

import { user } from '@tradeyard-v2/server/schemas';

export const GetUser = zod.object({}).merge(user);

export const GetUsers = zod.object({
  items: zod.array(user),
});
