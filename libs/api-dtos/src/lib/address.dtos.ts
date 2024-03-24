import * as zod from 'zod';

export const Country = zod.object({
  country_id: zod.string().uuid(),
  symbol: zod.string().min(3).max(3),
  name: zod.string(),
});

export const Address = zod.object({
  address_line_1: zod.string(),
  address_line_2: zod.string().optional(),
  city: zod.string(),
  state: zod.string().optional(),
  postal_code: zod.string(),
  country_id: zod.string().uuid(),
});
