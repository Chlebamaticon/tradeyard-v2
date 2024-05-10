import { CommonModule } from '@angular/common';
import { Component, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  NbButtonModule,
  NbCardModule,
  NbStepComponent,
  NbStepperComponent,
  NbStepperModule,
} from '@nebular/theme';
import {
  tap,
  map,
  switchMap,
  withLatestFrom,
  firstValueFrom,
  combineLatest,
  shareReplay,
} from 'rxjs';

import { OrderStatus } from '@tradeyard-v2/api-dtos';

import { AuthService } from '../../../modules/auth';
import { UnitPipe } from '../../../pipes/unit.pipe';

import { ComplaintThreadComponent } from './complaint-thread.component';
import {
  MerchantStep,
  merchantStepToCompleted,
  merchantStepToStatus,
} from './constants/steps';
import { BaseContract, MerchantContract } from './facades';

@Component({
  standalone: true,
  selector: 'app-merchant-flow',
  templateUrl: './merchant-flow.component.html',
  styleUrls: ['./merchant-flow.component.scss'],
  imports: [
    CommonModule,
    NbButtonModule,
    NbCardModule,
    NbStepperModule,
    ComplaintThreadComponent,
    UnitPipe,
  ],
  providers: [MerchantContract],
})
export class MerchantFlowComponent {
  readonly pending = signal(false);
  readonly pending$ = toObservable(this.pending);

  readonly stepper = viewChild('stepper', { read: NbStepperComponent });
  readonly stepper$ = toObservable(this.stepper);

  readonly depositStepRef = viewChild('depositRef', { read: NbStepComponent });
  readonly depositStep$ = toObservable(this.depositStepRef);
  readonly confirmStepRef = viewChild('confirmRef', {
    read: NbStepComponent,
  });
  readonly confirmStep$ = toObservable(this.confirmStepRef);
  readonly prepareStepRef = viewChild('prepareRef', {
    read: NbStepComponent,
  });
  readonly prepareStep$ = toObservable(this.prepareStepRef);
  readonly shippingStepRef = viewChild('shippingRef', {
    read: NbStepComponent,
  });
  readonly shippingStep$ = toObservable(this.shippingStepRef);
  readonly shippedStepRef = viewChild('shippedRef', { read: NbStepComponent });
  readonly shippedStep$ = toObservable(this.shippedStepRef);
  readonly doneStepRef = viewChild('doneRef', { read: NbStepComponent });
  readonly doneStep$ = toObservable(this.doneStepRef);

  readonly data$ = combineLatest({
    previousStatus: this.baseContract.getPreviousStatus(),
    currentStatus: this.baseContract.getStatus(),
    tokenAmount: this.baseContract.getTokenAmount(),
    tokenAddress: this.baseContract.getTokenAddress(),
  }).pipe(shareReplay(1));

  readonly activeStep$ = this.data$.pipe(
    map(({ currentStatus, previousStatus }) =>
      Object.keys(merchantStepToStatus).find((step) =>
        merchantStepToStatus[step as MerchantStep].includes(
          this.isComplaint(currentStatus) ? previousStatus : currentStatus
        )
      )
    )
  );

  readonly activeStepRef$ = this.activeStep$.pipe(
    switchMap((step) => {
      switch (step) {
        case 'deposit':
          return this.depositStep$;
        case 'confirm':
          return this.confirmStep$;
        case 'preparing':
          return this.prepareStep$;
        case 'shipping':
          return this.shippingStep$;
        case 'shipped':
          return this.shippedStep$;
        case 'done':
          return this.doneStep$;
        default:
          return [];
      }
    })
  );

  readonly updateStepperOnStatusChange$ = this.activeStepRef$
    .pipe(
      withLatestFrom(this.stepper$),
      tap(([activeStep, stepper]) => {
        if (!activeStep) return;
        if (!stepper) return;

        stepper.disableStepNavigation = false;
        stepper.changeStep(activeStep);
        stepper.disableStepNavigation = true;
      }),
      takeUntilDestroyed()
    )
    .subscribe();

  constructor(
    readonly auth: AuthService,
    readonly baseContract: BaseContract,
    readonly merchantContract: MerchantContract
  ) {}

  async cancel() {
    this.pending.set(true);
    await firstValueFrom(this.merchantContract.cancel());
    this.pending.set(false);
  }

  async confirm() {
    this.pending.set(true);
    await firstValueFrom(this.merchantContract.confirm());
    this.pending.set(false);
  }

  async shipping() {
    this.pending.set(true);
    await firstValueFrom(this.merchantContract.shipping());
    this.pending.set(false);
  }

  async shipped() {
    this.pending.set(true);
    await firstValueFrom(this.merchantContract.shipped());
    this.pending.set(false);
  }

  async release() {
    this.pending.set(true);
    await firstValueFrom(this.merchantContract.release());
    this.pending.set(false);
  }

  isCompleted(
    step: MerchantStep,
    data: { previousStatus: OrderStatus; currentStatus: OrderStatus }
  ): boolean {
    const status = this.isComplaint(data.currentStatus)
      ? data.previousStatus
      : data.currentStatus;
    return merchantStepToCompleted[step].includes(status);
  }

  isComplaint(status: OrderStatus): boolean {
    return [
      OrderStatus.MerchantComplaint,
      OrderStatus.CustomerComplaint,
    ].includes(status);
  }
}
