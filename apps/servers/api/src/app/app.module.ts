import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { DatabaseModule } from '@tradeyard-v2/server/database';

import { AlchemyModule } from '../modules/alchemy';
import { AuthGuardModule, AuthRouteModule } from '../modules/auth';
import {
  ComplaintMessagesRouteModule,
  ComplaintsRouteModule,
} from '../modules/complaints';
import { CustomersRouteModule } from '../modules/customers';
import { MerchantsRouteModule } from '../modules/merchants';
import { ModeratorsRouteModule } from '../modules/moderators';
import { OffersRouteModule, OfferVariantsRouteModule } from '../modules/offers';
import { OrdersRouteModule } from '../modules/orders';
import { SeedModule } from '../modules/seed';
import { TokensRouteModule } from '../modules/tokens';
import { UsersRouteModule, UserWalletsRouteModule } from '../modules/users';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DatabaseModule,
    SeedModule,
    AlchemyModule,
    AuthGuardModule,
    ComplaintsRouteModule,
    ComplaintMessagesRouteModule,
    CustomersRouteModule,
    MerchantsRouteModule,
    OfferVariantsRouteModule,
    OffersRouteModule,
    UsersRouteModule,
    TokensRouteModule,
    OrdersRouteModule,
    AuthRouteModule,
    UserWalletsRouteModule,
    RouterModule.register([
      {
        path: 'auth',
        module: AuthRouteModule,
      },
      {
        path: 'customers',
        module: CustomersRouteModule,
      },
      {
        path: 'merchants',
        module: MerchantsRouteModule,
      },
      {
        path: 'moderators',
        module: ModeratorsRouteModule,
      },
      {
        path: 'offers',
        module: OffersRouteModule,
        children: [
          {
            path: ':offer_id/variants',
            module: OfferVariantsRouteModule,
          },
        ],
      },
      {
        path: 'orders',
        module: OrdersRouteModule,
      },
      {
        path: 'users',
        module: UsersRouteModule,
      },
      {
        path: 'wallets',
        module: UserWalletsRouteModule,
      },
      {
        path: 'tokens',
        module: TokensRouteModule,
      },
      {
        path: 'complaints',
        module: ComplaintsRouteModule,
        children: [
          {
            path: ':complaint_id/messages',
            module: ComplaintMessagesRouteModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
