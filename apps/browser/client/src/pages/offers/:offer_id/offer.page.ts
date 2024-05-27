import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
} from '@nebular/theme';
import {
  combineLatest,
  combineLatestWith,
  firstValueFrom,
  merge,
  mergeWith,
  Observable,
  switchMap,
  withLatestFrom,
} from 'rxjs';

import {
  GetWhoamiDto,
  OfferVariantDto,
  TokenSymbolDto,
} from '@tradeyard-v2/api-dtos';

import { OfferVariantCardComponent } from '../../../components';
import {
  OfferApiService,
  OfferVariantApiService,
} from '../../../modules/api/services';
import { AuthService, Whoami } from '../../../modules/auth';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
    OfferVariantCardComponent,
  ],
  selector: 'app-offer-page',
  templateUrl: './offer.page.html',
  styleUrls: ['./offer.page.scss'],
})
export class OfferPage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();
  readonly refresh$ = new EventEmitter<void>();
  readonly order$ = new EventEmitter<[string, string]>();

  readonly offer$ = merge(this.init$, this.refresh$).pipe(
    withLatestFrom(this.route.params),
    switchMap(([_, { offer_id }]) => this.offerApiService.one({ offer_id })),
    takeUntilDestroyed()
  );

  readonly data$ = combineLatest({
    offer: this.offer$,
    whoami: this.whoami,
  });

  constructor(
    @Inject(Whoami)
    readonly whoami: Observable<GetWhoamiDto>,
    readonly route: ActivatedRoute,
    readonly authService: AuthService,
    readonly offerApiService: OfferApiService,
    readonly offerVariantApiService: OfferVariantApiService
  ) {}

  ngAfterViewInit() {
    this.init$.emit();
    this.init$.complete();
  }

  async detectVariantChanges(
    before: OfferVariantDto,
    after: Pick<OfferVariantDto, 'title' | 'description'> & {
      price: { amount: number; token: string };
    }
  ) {
    const didChanged = {
      variant:
        before.title !== after.title ||
        before.description !== after.description,
      variantPrice:
        before.current_price?.amount !== after.price?.amount ||
        before.current_price?.token.symbol !== after.price?.token,
    };

    if (didChanged.variant || didChanged.variantPrice) {
      await firstValueFrom(
        this.offerVariantApiService.update({
          offer_id: before.offer_id,
          offer_variant_id: before.offer_variant_id,
          ...(didChanged.variant
            ? {
                title: after.title,
                description: after.description,
              }
            : {}),
          ...(didChanged.variantPrice
            ? {
                price: {
                  amount: after.price.amount,
                  token: after.price.token as TokenSymbolDto,
                },
              }
            : {}),
        })
      );
      this.refresh$.emit();
    }
  }

  async remove(variant: OfferVariantDto) {
    await firstValueFrom(this.offerVariantApiService.remove(variant));
    this.refresh$.emit();
  }
}
