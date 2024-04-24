import { NgModule } from '@angular/core';

import { ApiModule } from '../api';

import { AuthService } from './services/auth.service';

@NgModule({
  providers: [AuthService, ApiModule],
  exports: [],
})
export class AuthModule {}
