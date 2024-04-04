import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-merchant-offers-header',
  template: `
    <div class="header">
      <div class="header__title">Offers</div>
      <div class="header__actions">
        <button color="primary" routerLink="/merchant/offers/create">
          Create Offer
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./merchant-offers-header.component.scss'],
})
export class MerchantOffersHeaderComponent {}
