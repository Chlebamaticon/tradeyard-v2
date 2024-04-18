import { Module } from '@nestjs/common';

import { CustomersController } from './customers.controller';
import { CustomersModule } from './customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [CustomersController],
})
export class CustomersRouteModule {}
