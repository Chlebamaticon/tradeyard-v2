import { Module } from '@nestjs/common';

import { CustomersController } from './controllers';
import { CustomerModule } from './customer.module';

@Module({
  imports: [CustomerModule],
  controllers: [CustomersController],
})
export class CustomersRouteModule {}
