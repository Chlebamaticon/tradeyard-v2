import * as zod from 'zod';
import { Contract } from './contract.dtos';

export const Token = zod.object({
  symbol: zod.string(),
  name: zod.string(),
  precision: zod.number(),
  contract_id: zod.string().uuid(),
  contract: Contract,
});
