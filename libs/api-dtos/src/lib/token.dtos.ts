import * as zod from 'zod';

import { Contract } from './contract.dtos';
import { pagination, queryParams } from './pagination.dtos';

export const Token = zod.object({
  token_id: zod.string().uuid(),
  symbol: zod.string(),
  name: zod.string(),
  precision: zod.number(),
  // contract_id: zod.string().uuid(),
  // contract: Contract,
});
export type TokenDto = zod.infer<typeof Token>;

export const GetTokenPathParams = zod
  .object({})
  .merge(Token.pick({ token_id: true }));
export const GetToken = zod.object({}).merge(Token);
export type GetTokenDto = zod.infer<typeof GetToken>;
export type GetTokenPathParamsDto = zod.infer<typeof GetTokenPathParams>;

export const GetTokensQueryParams = queryParams({});
export const GetTokens = pagination(Token);
export type GetTokensDto = zod.infer<typeof GetTokens>;
export type GetTokensQueryParamsDto = zod.infer<typeof GetTokensQueryParams>;
