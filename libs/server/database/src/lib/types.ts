import * as zod from 'zod';

import { eventSchemas } from '@tradeyard-v2/server/schemas';

export type EventType = keyof typeof eventSchemas;

export type EventBody<ET extends EventType = EventType> = zod.infer<
  (typeof eventSchemas)[ET]
>;
