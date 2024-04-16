import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
} from '@nebular/theme';
import { scan, switchMap } from 'rxjs';

import { OfferDto, OfferVariantDto } from '@tradeyard-v2/api-dtos';

import { OfferApiService } from '../../../../../modules/api/services';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonGroupModule,
    NbButtonModule,
  ],
  selector: 'app-offer-order-page',
  templateUrl: './offer-order.page.html',
  styleUrls: ['./offer-order.page.scss'],
})
export class OfferOrderPage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();
  readonly order$ = new EventEmitter<[string, string]>();

  get snapshot() {
    return this.route.snapshot;
  }

  readonly selection$ = this.route.params.pipe(
    switchMap(({ offer_id }) => this.offerApiService.one({ offer_id })),
    scan(
      (
        acc: { offer: OfferDto | null; variant: OfferVariantDto | null },
        offer
      ) => ({
        ...acc,
        offer,
        variant:
          offer.variants.find(
            ({ offer_variant_id }) =>
              offer_variant_id ===
              this.route.snapshot.params['offer_variant_id']
          ) ?? null,
      }),
      { offer: null, variant: null }
    )
  );

  constructor(
    readonly route: ActivatedRoute,
    readonly offerApiService: OfferApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
