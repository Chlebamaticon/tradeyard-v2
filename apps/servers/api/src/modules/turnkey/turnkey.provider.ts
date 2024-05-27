import { Provider } from '@nestjs/common';
import * as turnkey from '@turnkey/sdk-server';

export const Turnkey = Symbol('turnkey:base');

export const turnkeyProvider: Provider<turnkey.Turnkey> = {
  provide: Turnkey,
  useFactory: () =>
    new turnkey.Turnkey({
      apiBaseUrl: 'https://api.turnkey.com',
      apiPrivateKey: process.env.TURNKEY_API_PRIVKEY!,
      apiPublicKey: process.env.TURNKEY_API_PUBKEY!,
      defaultOrganizationId: process.env.TURNKEY_ORGID!,
    }),
  inject: [],
};
