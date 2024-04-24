import { Module } from '@nestjs/common';

import { CustomerModule } from './customer.module';
import { CustomersController } from './customers.controller';

@Module({
  imports: [CustomerModule],
  controllers: [CustomersController],
})
export class CustomersRouteModule {}
