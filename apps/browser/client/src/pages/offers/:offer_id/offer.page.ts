import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
} from '@nebular/theme';
import { switchMap, withLatestFrom } from 'rxjs';

import { OfferApiService } from '../../../modules/api/services';
import { AuthService } from '../../../modules/auth';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
  ],
  selector: 'app-offer-page',
  templateUrl: './offer.page.html',
  styleUrls: ['./offer.page.scss'],
})
export class OfferPage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();
  readonly order$ = new EventEmitter<[string, string]>();

  readonly offer$ = this.route.params.pipe(
    switchMap(({ offer_id }) => this.offerApiService.one({ offer_id }))
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
