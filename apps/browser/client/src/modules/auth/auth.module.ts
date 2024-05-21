import { NgModule } from '@angular/core';

import { ApiModule } from '../api';

import { AuthTurnkeyService } from './services/auth-turnkey.service';
import { AuthService } from './services/auth.service';

@NgModule({
  providers: [AuthService, AuthTurnkeyService, ApiModule],
  exports: [],
})
export class AuthModule {}
