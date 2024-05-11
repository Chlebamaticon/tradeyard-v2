import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbActionsModule, NbUserModule } from '@nebular/theme';

import { AuthService } from '../../modules/auth';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, NbActionsModule, NbUserModule],
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  constructor(readonly auth: AuthService) {}

  get name() {
    const { payload } = this.auth;
    return payload ? `${payload.first_name} ${payload.last_name}` : undefined;
  }

  get role() {
    const { payload } = this.auth;
    if (payload) {
      if (payload.customer_id) return 'Customer';
      if (payload.merchant_id) return 'Merchant';
      if (payload.moderator_id) return 'Moderator';
    }
    return undefined;
  }
}
