import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Self } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbListModule, NbTagModule } from '@nebular/theme';

import { UserWalletApiService } from '../../modules/api/services';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbListModule,
    NbTagModule,
  ],
  selector: 'app-profile-wallets-page',
  templateUrl: './profile-wallets.page.html',
  styleUrls: ['./profile-wallets.page.scss'],
  providers: [OnDestroyNotifier$],
})
export class ProfileWalletsPage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();

  readonly wallets = this.userWalletApiService.many({
    initialParams: { offset: 0, limit: 20, timestamp: Date.now() },
    initNotifier: this.init$,
    destroyNotifier: this.destroy$,
  });

  constructor(
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly userWalletApiService: UserWalletApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
