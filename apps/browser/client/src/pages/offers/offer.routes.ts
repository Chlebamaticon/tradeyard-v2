import { Route } from '@angular/router';

import { ConnectedOnly } from '../../modules/auth/guards';

import { OfferPage } from './:offer_id/offer.page';
import { OfferOrderPage } from './:offer_id/order/:offer_variant_id/offer-order.page';
import { OfferCreatePage } from './offer-create.page';
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
        path: 'create',
        component: OfferCreatePage,
      },
      {
        path: ':offer_id',
        component: OfferPage,
      },
      {
        canActivate: [ConnectedOnly],
        path: ':offer_id/order/:offer_variant_id',
        component: OfferOrderPage,
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
