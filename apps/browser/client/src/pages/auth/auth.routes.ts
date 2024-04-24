import { Route } from '@angular/router';

import { CustomerAuthPage } from './customer/customer-auth.page';
import { CustomerSignUpPage } from './customer/sign-up/sign-up.page';
import { AuthIndexPage } from './index.page';
import { AuthLayoutPage } from './layout.page';
import { MerchantAuthPage } from './merchant/merchant-auth.page';
import { MerchantSignUpPage } from './merchant/sign-up/sign-up.page';
import { SignInPage } from './sign-in.page';

export const authRoutes: Route[] = [
  {
    path: '',
    component: AuthLayoutPage,
    children: [
      {
        path: '',
        component: AuthIndexPage,
      },
      {
        path: 'sign-in',
        component: SignInPage,
      },
    ],
  },
  {
    path: 'merchant',
    component: MerchantAuthPage,
    children: [
      {
        path: 'sign-up',
        component: MerchantSignUpPage,
      },
      {
        path: '**',
        redirectTo: 'sign-up',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'customer',
    component: CustomerAuthPage,
    children: [
      {
        path: 'sign-up',
        component: CustomerSignUpPage,
      },
      {
        path: '**',
        redirectTo: 'sign-up',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
