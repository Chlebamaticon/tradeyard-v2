import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AuthInterceptor } from './interceptors';
import services from './services';
import { OrderContractService } from './services/order-contract.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    ...services,
    OrderContractService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  exports: [],
})
export class ApiModule {}
