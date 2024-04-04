import { Route } from '@angular/router';

export const merchantRoutes: Route[] = [
  {
    path: 'merchant',
    children: [
      {
        path: 'offers',
        loadChildren: () =>
          import('./offers/merchant-offers.route').then(
            ({ merchantOfferRoutes }) => merchantOfferRoutes
          ),
      },
    ],
  },
];
