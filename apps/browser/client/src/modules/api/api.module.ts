import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AuthInterceptor } from './interceptors';
import {
  AuthApiService,
  BaseApiService,
  OfferApiService,
  OrderApiService,
  TokenApiService,
} from './services';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    BaseApiService,
    AuthApiService,
    OfferApiService,
    OrderApiService,
    TokenApiService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  exports: [],
})
export class ApiModule {}
