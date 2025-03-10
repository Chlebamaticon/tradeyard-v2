import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NbButtonModule, NbCardModule, NbStepperModule } from '@nebular/theme';
import { combineLatest, shareReplay } from 'rxjs';

import { OrderStatus } from '@tradeyard-v2/api-dtos';

import { AuthService } from '../../../modules/auth';
import { UnitPipe } from '../../../pipes/unit.pipe';

import { ComplaintThreadComponent } from './complaint-thread.component';
import { BaseContractFacade, ModeratorContractFacade } from './facades';

@Component({
  standalone: true,
  selector: 'app-moderator-flow',
  templateUrl: './moderator-flow.component.html',
  styleUrls: ['./moderator-flow.component.scss'],
  imports: [
    CommonModule,
    NbButtonModule,
    NbCardModule,
    NbStepperModule,
    ComplaintThreadComponent,
    UnitPipe,
  ],
  providers: [BaseContractFacade, ModeratorContractFacade],
})
export class ModeratorFlowComponent {
  readonly pending = signal(false);
  readonly pending$ = toObservable(this.pending);

  readonly data$ = combineLatest({
    previousStatus: this.baseContract.getPreviousStatus(),
    currentStatus: this.baseContract.getStatus(),
    tokenAmount: this.baseContract.getTokenAmount(),
    tokenAddress: this.baseContract.getTokenAddress(),
  }).pipe(shareReplay(1));

  constructor(
    readonly auth: AuthService,
    readonly baseContract: BaseContractFacade,
    readonly moderatorFacade: ModeratorContractFacade
  ) {}

  async refund() {
    this.pending.set(true);
    await this.moderatorFacade.refund();
    this.pending.set(false);
  }

  async release() {
    this.pending.set(true);
    await this.moderatorFacade.release();
    this.pending.set(false);
  }

  async reject() {
    this.pending.set(true);
    await this.moderatorFacade.reject();
    this.pending.set(false);
  }

  isComplaint(status: OrderStatus): boolean {
    return [
      OrderStatus.MerchantComplaint,
      OrderStatus.CustomerComplaint,
    ].includes(status);
  }
}
