import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  Self,
} from '@angular/core';
import { NbCardModule, NbTagModule } from '@nebular/theme';
import { defer, exhaustMap, from, Observable } from 'rxjs';

import { AuthService, TurnkeyWalletClient } from '../../modules/auth';
import { UnitPipe } from '../../pipes/unit.pipe';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  selector: 'app-wallet-card',
  templateUrl: './wallet-card.component.html',
  styleUrls: ['./wallet-card.component.scss'],
  imports: [CommonModule, NbCardModule, NbTagModule, UnitPipe],
  providers: [OnDestroyNotifier$],
})
export class WalletCardComponent implements AfterViewInit {
  @Input() address!: string;
  @Input() type!: string;
  @Input() created_at!: string;
  readonly init$ = new EventEmitter<void>();

  readonly balance$ = defer(() =>
    this.walletClient.pipe(
      exhaustMap(async (walletClient) => ({
        amount: await walletClient.getBalance({
          address: walletClient.account.address,
        }),
        symbol: walletClient.chain.nativeCurrency.symbol,
      }))
    )
  );

  constructor(
    @Inject(TurnkeyWalletClient)
    readonly walletClient: Observable<any>,
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
