import { Route } from '@angular/router';

import { OrderOverviewPage } from './:order_id/order-overview.page';
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
