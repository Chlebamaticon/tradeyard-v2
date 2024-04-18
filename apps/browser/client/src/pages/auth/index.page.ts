import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule } from '@nebular/theme';

@Component({
  standalone: true,
  imports: [NbButtonModule, NbCardModule, RouterModule],
  selector: 'app-auth-index-page',
  template: `<nb-card>
    <nb-card-body class="wrapper">
      <h6>Great to see you!</h6>

      <button nbButton status="primary" routerLink="/auth/sign-in">
        Sign in
      </button>

      <div class="divider"></div>

      <div class="actions">
        <button nbButton outline routerLink="/auth/customer/sign-up">
          Sign up as Customer
        </button>

        <button nbButton outline routerLink="/auth/merchant/sign-up">
          Sign up as Merchant
        </button>
      </div>
    </nb-card-body>
  </nb-card>`,
  styleUrls: ['./index.page.scss'],
})
export class AuthIndexPage {}
