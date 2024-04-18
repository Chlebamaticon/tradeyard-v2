import { Module } from '@nestjs/common';

import { OrdersController } from './orders.controller';
import { OrdersModule } from './orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [OrdersController],
})
export class OrdersRouteModule {}
