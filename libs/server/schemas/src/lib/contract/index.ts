import * as zod from 'zod';

import { HASH_REGEX } from '../regex';

export const Contract = zod.object({
  contract_id: zod.string().uuid(),
  deployment: zod.object({
    transaction_hash: zod.string().regex(HASH_REGEX),
    address: zod.string().optional(),
    error_message: zod.string().optional(),
  }),
});

export default {
  'contract:created': Contract.pick({ contract_id: true }),
  'contract:deployment:started': Contract.pick({
    contract_id: true,
    deployment: true,
  }),
  'contract:deployment:failed': Contract.pick({
    contract_id: true,
    deployment: true,
  }),
  'contract:deployment:completed': Contract.pick({
    contract_id: true,
    deployment: true,
  }),
};
