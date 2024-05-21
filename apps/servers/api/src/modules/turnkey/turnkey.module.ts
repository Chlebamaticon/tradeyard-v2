import { Module } from '@nestjs/common';

import {
  turnkeyApiClientProvider,
  TurnkeyApiClient,
} from './turnkey-api-client.provider';
import { turnkeyProvider, Turnkey } from './turnkey.provider';

@Module({
  imports: [],
  providers: [turnkeyProvider, turnkeyApiClientProvider],
  exports: [Turnkey, TurnkeyApiClient],
})
export class TurnkeyModule {}
