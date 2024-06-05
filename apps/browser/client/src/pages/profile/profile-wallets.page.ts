import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Self } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbListModule } from '@nebular/theme';
import { firstValueFrom } from 'rxjs';

import { WalletCardComponent } from '../../components/wallet-card/wallet-card.component';
import { UserWalletApiService } from '../../modules/api/services';
import { AuthService, AuthTurnkeyService } from '../../modules/auth';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbButtonModule,
    NbListModule,
    WalletCardComponent,
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
    readonly auth: AuthService,
    readonly authTurnkey: AuthTurnkeyService,
    readonly userWalletApiService: UserWalletApiService
  ) {}

  async addWallet() {
    const { payload } = this.auth;
    if (!payload) return;
    const { email } = payload;
    const credentials = await this.authTurnkey.createWallet(email);
    const { user_wallet_id } = await firstValueFrom(
      this.userWalletApiService.create({
        challenge: credentials.encodedChallenge,
        attestation: credentials.attestation,
      })
    );

    this.wallets.refresh();
  }

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
