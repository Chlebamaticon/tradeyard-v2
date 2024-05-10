import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  input,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { exhaustMap, scan, switchMap, tap } from 'rxjs';

import { OfferDto, OfferVariantDto } from '@tradeyard-v2/api-dtos';

import {
  OfferApiService,
  OrderApiService,
} from '../../../../../modules/api/services';
import { AuthService } from '../../../../../modules/auth';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbSpinnerModule,
  ],
  selector: 'app-offer-order-page',
  templateUrl: './offer-order.page.html',
  styleUrls: ['./offer-order.page.scss'],
})
export class OfferOrderPage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();
  readonly order$ = new EventEmitter<[string, string]>();
  readonly loading = signal(false);
  readonly loading$ = toObservable(this.loading);

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

  readonly createOrder$ = this.order$
    .pipe(
      tap(() => this.loading.set(true)),
      exhaustMap(
        async ([offer_id, offer_variant_id]) =>
          [
            [offer_id, offer_variant_id],
            await this.authService.createOrUsePasskey(),
          ] as const
      ),
      exhaustMap(([[offer_id, offer_variant_id], customer_address]) =>
        this.orderApiService.create({
          offer_id,
          offer_variant_id,
          customer_address,
          quantity: 1,
        })
      ),
      tap(() => this.loading.set(false)),
      tap((order) => this.router.navigate(['/orders', order.order_id]))
    )
    .subscribe();

  constructor(
    readonly router: Router,
    readonly route: ActivatedRoute,
    readonly authService: AuthService,
    readonly offerApiService: OfferApiService,
    readonly orderApiService: OrderApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
