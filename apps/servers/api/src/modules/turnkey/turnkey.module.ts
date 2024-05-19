import { Module } from '@nestjs/common';

import turnkeyApiClientProvider from './turnkey-api-client.provider';
import turnkeyProvider from './turnkey.provider';

@Module({
  imports: [],
  providers: [turnkeyProvider, turnkeyApiClientProvider],
  exports: [turnkeyProvider, turnkeyApiClientProvider],
})
export class TurnkeyModule {}
