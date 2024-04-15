import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Self,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbLayoutModule,
  NbListModule,
} from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';

import { OfferApiService } from '../../modules/offer';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
    NbLayoutModule,
    NbListModule,
  ],
  selector: 'app-offers-explore-page',
  templateUrl: './offers-explore.page.html',
  styleUrls: ['./offers-explore.page.scss'],
  providers: [OnDestroyNotifier$],
})
export class OffersExplorePage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);

  readonly offers = this.offerApiService.many({
    initialParams: {
      offset: 0,
      limit: 20,
      timestamp: Date.now(),
    },
    initNotifier: this.init$,
    destroyNotifier: this.destroy$,
  });

  constructor(
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly offerApiService: OfferApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
