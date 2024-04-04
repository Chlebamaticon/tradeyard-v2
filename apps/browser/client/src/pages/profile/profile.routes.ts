import { Route } from '@angular/router';

import { ProfileWalletsPage } from './profile-wallets.page';
import { ProfilePage } from './profile.page';

export const profileRoutes: Route[] = [
  {
    path: '',
    component: ProfilePage,
    children: [
      {
        path: 'wallets',
        component: ProfileWalletsPage,
      },
      {
        path: '**',
        redirectTo: 'wallets',
        pathMatch: 'full',
      },
    ],
  },
];
