import { Route } from '@angular/router';

import { OfferPage } from './:offer_id/offer.page';
import { OffersExplorePage } from './offers-explore.page';
import { OffersPage } from './offers.page';

export const offerRoutes: Route[] = [
  {
    path: '',
    component: OffersPage,
    children: [
      {
        path: '',
        component: OffersExplorePage,
      },
      {
        path: ':offer_id',
        component: OfferPage,
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
