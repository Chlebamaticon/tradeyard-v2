import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { BaseApiService } from './base-api.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [BaseApiService],
  exports: [],
})
export class ApiModule {}
