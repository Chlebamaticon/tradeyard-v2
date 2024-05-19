import { Provider } from '@nestjs/common';
import * as turnkey from '@turnkey/sdk-server';

import { Turnkey } from './turnkey.provider';

export const TurnkeyApiClient = Symbol('turnkey:api-client');

export default {
  provide: TurnkeyApiClient,
  useFactory: (turnkey: turnkey.Turnkey) => turnkey.apiClient(),
  inject: [Turnkey],
} satisfies Provider<turnkey.TurnkeyApiClient>;
