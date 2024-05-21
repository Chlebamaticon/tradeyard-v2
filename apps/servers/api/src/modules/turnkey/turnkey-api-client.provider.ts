import { Provider } from '@nestjs/common';
import * as turnkey from '@turnkey/sdk-server';

import { Turnkey } from './turnkey.provider';

export const TurnkeyApiClient = Symbol('turnkey:api-client');

export const turnkeyApiClientProvider: Provider<turnkey.TurnkeyApiClient> = {
  provide: TurnkeyApiClient,
  useFactory: (turnkey: turnkey.Turnkey) => turnkey.apiClient(),
  inject: [Turnkey],
};
