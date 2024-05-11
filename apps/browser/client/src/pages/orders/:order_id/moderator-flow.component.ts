import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NbButtonModule, NbCardModule, NbStepperModule } from '@nebular/theme';
import { combineLatest, firstValueFrom, shareReplay } from 'rxjs';

import { ComplaintDto, OrderStatus } from '@tradeyard-v2/api-dtos';

import { ComplaintDecisionApiService } from '../../../modules/api/services';
import { AuthService } from '../../../modules/auth';
import { UnitPipe } from '../../../pipes/unit.pipe';

import { ComplaintThreadComponent } from './complaint-thread.component';
import { BaseContract } from './facades';
import { ActiveOrderComplaint } from './providers';

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
  providers: [BaseContract],
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
    @Inject(ActiveOrderComplaint) readonly complaint: ComplaintDto,
    readonly auth: AuthService,
    readonly baseContract: BaseContract,
    readonly complaintDecisionApi: ComplaintDecisionApiService
  ) {}

  async refund() {
    const { complaint_id } = await this.complaint;
    this.pending.set(true);
    await firstValueFrom(
      this.complaintDecisionApi.refund({
        complaint_id,
      })
    );
    this.pending.set(false);
  }

  async release() {
    const { complaint_id } = await this.complaint;
    this.pending.set(true);
    await firstValueFrom(
      this.complaintDecisionApi.release({
        complaint_id,
      })
    );
    this.pending.set(false);
  }

  async reject() {
    const { complaint_id } = await this.complaint;
    this.pending.set(true);
    await firstValueFrom(
      this.complaintDecisionApi.reject({
        complaint_id,
      })
    );
    this.pending.set(false);
  }

  isComplaint(status: OrderStatus): boolean {
    return [
      OrderStatus.MerchantComplaint,
      OrderStatus.CustomerComplaint,
    ].includes(status);
  }
}
