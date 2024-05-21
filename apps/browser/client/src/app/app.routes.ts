import { Route } from '@angular/router';

import { LayoutComponent } from '../components/layout/layout.component';
import { AuthenticatedOnly, UnauthenticatedOnly } from '../modules/auth/guards';

export const appRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'auth',
        canActivate: [UnauthenticatedOnly],
        loadChildren: () =>
          import('../pages/auth/auth.routes').then(
            ({ authRoutes }) => authRoutes
          ),
      },
      {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthenticatedOnly],
        children: [
          {
            path: '',
            redirectTo: 'offers',
            pathMatch: 'full',
          },
          {
            path: 'offers',
            loadChildren: () =>
              import('../pages/offers/offer.routes').then(
                ({ offerRoutes }) => offerRoutes
              ),
          },
          {
            path: 'orders',
            loadChildren: () =>
              import('../pages/orders/order.routes').then(
                ({ orderRoutes }) => orderRoutes
              ),
          },
          {
            path: 'profile',
            loadChildren: () =>
              import('../pages/profile/profile.routes').then(
                ({ profileRoutes }) => profileRoutes
              ),
          },
          {
            path: '**',
            redirectTo: '',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },
];
