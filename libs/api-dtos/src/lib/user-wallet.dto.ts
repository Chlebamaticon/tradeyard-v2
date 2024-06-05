import * as zod from 'zod';

import { pagination, queryParams } from './pagination.dtos';

export const Attestation = zod
  .object({
    credentialId: zod.string(),
    clientDataJson: zod.string(),
    attestationObject: zod.string(),
    transports: zod.array(
      zod.enum([
        'AUTHENTICATOR_TRANSPORT_BLE',
        'AUTHENTICATOR_TRANSPORT_INTERNAL',
        'AUTHENTICATOR_TRANSPORT_NFC',
        'AUTHENTICATOR_TRANSPORT_USB',
        'AUTHENTICATOR_TRANSPORT_HYBRID',
      ])
    ),
  })
  .required();

export const UserWallet = zod.object({
  user_wallet_id: zod.string().uuid(),
  user_id: zod.string().uuid(),
  address: zod.string(),
  sub_organization_id: zod.string(),
  chain: zod.string(),
  type: zod.enum(['turnkey', 'custodial']),
  created_at: zod.string().transform((val) => new Date(val).toUTCString()),
});
export type UserWalletDto = zod.infer<typeof UserWallet>;

export const CreateUserWalletBody = zod.object({}).merge(
  UserWallet.pick({
    address: true,
    type: true,
    chain: true,
    sub_organization_id: true,
  })
);
export const CreateUserWallet = zod.object({}).merge(UserWallet);
export type CreateUserWalletDto = zod.infer<typeof CreateUserWallet>;
export type CreateUserWalletBodyDto = zod.infer<typeof CreateUserWalletBody>;

export const GetUserWallet = zod.object({}).merge(UserWallet);
export type GetUserWalletDto = zod.infer<typeof GetUserWallet>;

export const GetUserWallets = pagination(UserWallet);
export const GetUserWalletsQueryParams = queryParams({});
export type GetUserWalletsDto = zod.infer<typeof GetUserWallets>;
export type GetUserWalletsQueryParamsDto = zod.infer<
  typeof GetUserWalletsQueryParams
>;

export const CreateTurnkeyWalletBody = zod.object({
  challenge: zod.string(),
  attestation: Attestation,
});
export const CreateTurnkeyWallet = zod.object({}).merge(UserWallet);
export type CreateTurnkeyWalletBodyDto = zod.infer<
  typeof CreateTurnkeyWalletBody
>;
export type CreateTurnkeyWalletDto = zod.infer<typeof CreateTurnkeyWallet>;
