import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input } from '@angular/core';
import { NbCardModule, NbStepperModule } from '@nebular/theme';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  firstValueFrom,
  switchMap,
  tap,
} from 'rxjs';
import { Address, isAddress } from 'viem';

import { OrderContractService } from '../../../modules/api/services/order-contract.service';
import { AuthService } from '../../../modules/auth';
import { UnitPipe } from '../../../pipes/unit.pipe';

@Component({
  standalone: true,
  selector: 'app-customer-flow',
  templateUrl: './customer-flow.component.html',
  styleUrls: ['./customer-flow.component.scss'],
  imports: [CommonModule, NbCardModule, NbStepperModule, UnitPipe],
})
export class CustomerFlowComponent implements AfterViewInit {
  @Input()
  set contractAddress(value: string) {
    this.#contractAddress$.next(value as Address);
  }
  get contractAddress(): string {
    return this.#contractAddress$.getValue();
  }
  #contractAddress$ = new BehaviorSubject<string>('');

  readonly init$ = new EventEmitter<void>();

  readonly depositAmount$ = this.#contractAddress$.pipe(
    filter((address): address is Address => isAddress(address)),
    switchMap((address) => this.orderContractService.getDepositAmount(address))
  );

  readonly state$ = this.#contractAddress$.pipe(
    filter((address): address is Address => isAddress(address)),
    switchMap((address) => this.orderContractService.getStatus(address))
  );

  constructor(
    readonly auth: AuthService,
    readonly orderContractService: OrderContractService
  ) {}

  async deposit(amount: bigint | null): Promise<void> {
    if (!amount) return;
    await firstValueFrom(
      this.orderContractService.deposit(this.contractAddress as Address, amount)
    );
  }

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
