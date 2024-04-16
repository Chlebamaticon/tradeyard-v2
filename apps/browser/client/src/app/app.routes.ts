import { Route } from '@angular/router';

import { LayoutComponent } from '../components/layout/layout.component';
import { AuthenticatedOnly, UnauthenticatedOnly } from '../modules/auth/guards';
import { CompleteAuthentication } from '../modules/auth/guards/complete-authentication.guard';
import { DashboardPage } from '../pages/dashboard/dashboard.page';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [CompleteAuthentication],
    children: [
      {
        path: 'auth',
        // canActivate: [UnauthenticatedOnly],
        loadChildren: () =>
          import('../pages/auth/auth.routes').then(
            ({ authRoutes }) => authRoutes
          ),
      },
      {
        path: '',
        component: LayoutComponent,
        // canActivate: [AuthenticatedOnly],
        children: [
          {
            path: '',
            component: DashboardPage,
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
