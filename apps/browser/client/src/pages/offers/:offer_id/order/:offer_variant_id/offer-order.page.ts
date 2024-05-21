import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
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
import { exhaustMap, scan, switchMap, tap, withLatestFrom } from 'rxjs';
import { WalletClient } from 'viem';

import {
  GetWhoamiDto,
  OfferDto,
  OfferVariantDto,
} from '@tradeyard-v2/api-dtos';

import {
  OfferApiService,
  OrderApiService,
} from '../../../../../modules/api/services';
import {
  AuthService,
  TurnkeyWalletClient,
  Whoami,
} from '../../../../../modules/auth';

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
      withLatestFrom(this.walletClient),
      exhaustMap(([[offer_id, offer_variant_id], walletClient]) =>
        this.orderApiService.create({
          offer_id,
          offer_variant_id,
          customer_address: walletClient.account!.address,
          quantity: 1,
        })
      ),
      tap(() => this.loading.set(false)),
      tap((order) => this.router.navigateByUrl(`/orders/${order.order_id}`))
    )
    .subscribe();

  constructor(
    readonly router: Router,
    readonly route: ActivatedRoute,
    readonly authService: AuthService,
    readonly offerApiService: OfferApiService,
    readonly orderApiService: OrderApiService,
    @Inject(TurnkeyWalletClient)
    readonly walletClient: Promise<WalletClient>
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
