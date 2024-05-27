import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbLayoutModule,
} from '@nebular/theme';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  exhaustMap,
  merge,
  Observable,
  of,
  tap,
} from 'rxjs';

import { GetWhoamiDto } from '@tradeyard-v2/api-dtos';

import {
  collectPathParamsWithActivatedRoute,
  collectPathParamsWithEvents,
} from '../../helpers';
import { OfferApiService } from '../../modules/api/services';
import { Whoami } from '../../modules/auth';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbLayoutModule,
    NbButtonGroupModule,
    NbButtonModule,
  ],
  selector: 'app-offers-page',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage {
  readonly loading = new BehaviorSubject(false);
  readonly data$ = combineLatest({
    whoami: this.whoami,
    offer: merge(
      collectPathParamsWithActivatedRoute(this.activatedRoute),
      collectPathParamsWithEvents(this.router)
    ).pipe(
      distinctUntilChanged(),
      tap(() => this.loading.next(true)),
      exhaustMap(({ offer_id }) =>
        offer_id ? this.offerApiService.one({ offer_id: offer_id }) : of(null)
      ),
      tap(() => this.loading.next(false))
    ),
  });

  constructor(
    readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    readonly offerApiService: OfferApiService,
    @Inject(Whoami) readonly whoami: Observable<GetWhoamiDto>
  ) {
    console.log(router);
  }
}
