import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { OfferApiService, TokenApiService } from './services';
import { BaseApiService } from './services/base-api.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [BaseApiService, OfferApiService, TokenApiService],
  exports: [],
})
export class ApiModule {}
