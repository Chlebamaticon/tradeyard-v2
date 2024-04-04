import { Route } from '@angular/router';

import { MerchantOfferCreatePage } from './create/merchant-offer-create.page';
import { MerchantOffersExplorePage } from './merchant-offers-explore.page';

export const merchantOfferRoutes: Route[] = [
  {
    path: '',
    component: MerchantOffersExplorePage,
  },
  {
    path: 'create',
    component: MerchantOfferCreatePage,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
