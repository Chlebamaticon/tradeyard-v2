import { Provider } from '@nestjs/common';
import * as turnkey from '@turnkey/sdk-server';

export const Turnkey = Symbol('turnkey:base');

export default {
  provide: Turnkey,
  useFactory: () =>
    new turnkey.Turnkey({
      apiBaseUrl: 'https://api.turnkey.com',
      apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY,
      apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY,
      defaultOrganizationId: process.env.TURNKEY_ORGANIZATION_ID,
    }),
  inject: [],
} satisfies Provider<turnkey.Turnkey>;
