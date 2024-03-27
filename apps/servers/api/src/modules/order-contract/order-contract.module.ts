import { Module } from '@nestjs/common';

import { AlchemyModule } from '../alchemy';

@Module({
  imports: [AlchemyModule],
})
export class AlchemyTradeyardContractModule {}
