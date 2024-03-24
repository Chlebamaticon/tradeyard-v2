import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { DatabaseModule } from '@tradeyard-v2/server/database';

import { AlchemyModule } from '../modules/alchemy/alchemy.module';
import { CustomersRouteModule } from '../modules/customers';
import { MerchantsRouteModule } from '../modules/merchants';
import { OffersRouteModule } from '../modules/offers';
import { UsersRouteModule } from '../modules/users';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DatabaseModule,
    AlchemyModule,
    CustomersRouteModule,
    MerchantsRouteModule,
    OffersRouteModule,
    UsersRouteModule,
    RouterModule.register([
      {
        path: 'api',
        children: [
          {
            path: 'customers',
            module: CustomersRouteModule,
          },
          {
            path: 'merchants',
            module: MerchantsRouteModule,
          },
          {
            path: 'offers',
            module: OffersRouteModule,
          },
          {
            path: 'users',
            module: UsersRouteModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
