import { Module } from '@nestjs/common';

import { OffersController } from './controllers';
import { OffersModule } from './offers.module';

@Module({
  imports: [OffersModule],
  controllers: [OffersController],
})
export class OffersRouteModule {}
