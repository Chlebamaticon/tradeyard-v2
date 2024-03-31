import * as zod from 'zod';

export const paginationQueryParams = zod
  .object({
    offset: zod.number().min(0),
    limit: zod.number().min(1),
    timestamp: zod.number().min(0),
  })
  .partial();

export const queryParams = <Shape extends Zod.ZodRawShape>(shape: Shape) =>
  zod.object(shape).merge(paginationQueryParams).partial();

export const pagination = <Schema extends Zod.ZodSchema>(schema: Schema) =>
  zod
    .object({
      items: zod.array(schema),
      total: zod.number().min(0),
    })
    .merge(paginationQueryParams);
