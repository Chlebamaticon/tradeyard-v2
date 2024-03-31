import { NgModule } from '@angular/core';

import { AuthService } from './services/auth.service';

@NgModule({
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
