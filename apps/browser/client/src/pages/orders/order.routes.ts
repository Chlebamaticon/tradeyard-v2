import { Route } from '@angular/router';

import { ConnectedOnly } from '../../modules/auth/guards';

import { OrderOverviewPage } from './:order_id/order-overview.page';
import { OrderExist } from './order-exist.guard';
import { OrdersExplorePage } from './orders-explore.page';
import { OrdersPage } from './orders.page';

export const orderRoutes: Route[] = [
  {
    path: '',
    component: OrdersPage,
    children: [
      {
        path: '',
        component: OrdersExplorePage,
      },
      {
        canActivate: [OrderExist, ConnectedOnly],
        path: ':order_id',
        component: OrderOverviewPage,
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
