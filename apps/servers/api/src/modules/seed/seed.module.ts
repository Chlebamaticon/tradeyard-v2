import { Module } from '@nestjs/common';

import { TokenSeedProvider } from './fixtures';
import { SeedToggleProvider } from './seed-toggle.provider';

@Module({
  providers: [SeedToggleProvider, TokenSeedProvider],
})
export class SeedModule {}
