import { Route } from '@angular/router';

import { LayoutComponent } from '../components/layout/layout.component';
import { AuthenticatedOnly, UnauthenticatedOnly } from '../modules/auth/guards';
import { CompleteAuthentication } from '../modules/auth/guards/complete-authentication.guard';
import { SignInPage } from '../pages/auth/sign-in.page';
import { DashboardPage } from '../pages/dashboard/dashboard.page';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [CompleteAuthentication],
    children: [
      {
        path: 'auth',
        canActivate: [UnauthenticatedOnly],
        children: [
          {
            path: 'sign-in',
            component: SignInPage,
          },
          {
            path: '**',
            redirectTo: 'sign-in',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthenticatedOnly],
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
            path: '**',
            redirectTo: '',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },
];
