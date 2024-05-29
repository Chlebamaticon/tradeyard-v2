import { CommonModule } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  NbButtonModule,
  NbCardModule,
  NbStepComponent,
  NbStepperComponent,
  NbStepperModule,
} from '@nebular/theme';
import {
  combineLatest,
  firstValueFrom,
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

import { OrderStatus } from '@tradeyard-v2/api-dtos';

import { AuthService } from '../../../modules/auth';
import { UnitPipe } from '../../../pipes/unit.pipe';

import { ComplaintThreadComponent } from './complaint-thread.component';
import {
  CustomerStep,
  customerStepToCompleted,
  customerStepToStatus,
} from './constants/steps';
import { BaseContractFacade, CustomerContractFacade } from './facades';

@Component({
  standalone: true,
  selector: 'app-customer-flow',
  templateUrl: './customer-flow.component.html',
  styleUrls: ['./customer-flow.component.scss'],
  imports: [
    CommonModule,
    NbButtonModule,
    NbCardModule,
    NbStepperModule,
    ComplaintThreadComponent,
    UnitPipe,
  ],
  providers: [CustomerContractFacade],
})
export class CustomerFlowComponent {
  readonly stepper = viewChild('stepper', { read: NbStepperComponent });
  readonly stepper$ = toObservable(this.stepper);

  readonly depositStepRef = viewChild('depositRef', { read: NbStepComponent });
  readonly depositStep$ = toObservable(this.depositStepRef);
  readonly executionStepRef = viewChild('executionRef', {
    read: NbStepComponent,
  });
  readonly executionStep$ = toObservable(this.executionStepRef);
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
      Object.keys(customerStepToStatus).find((step) =>
        customerStepToStatus[step as CustomerStep].includes(
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
        case 'execution':
          return this.executionStep$;
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
    readonly baseContract: BaseContractFacade,
    readonly customerContract: CustomerContractFacade
  ) {}

  async deposit(amount: bigint | null): Promise<void> {
    if (!amount) return;
    await firstValueFrom(this.customerContract.deposit(amount));
  }

  async release(): Promise<void> {
    await firstValueFrom(this.customerContract.release());
  }

  async complaint(): Promise<void> {
    await firstValueFrom(this.customerContract.complaint());
  }

  isCompleted(
    step: CustomerStep,
    data: { previousStatus: OrderStatus; currentStatus: OrderStatus }
  ): boolean {
    const status = this.isComplaint(data.currentStatus)
      ? data.previousStatus
      : data.currentStatus;
    return customerStepToCompleted[step].includes(status);
  }

  isComplaint(status: OrderStatus): boolean {
    return [
      OrderStatus.MerchantComplaint,
      OrderStatus.CustomerComplaint,
    ].includes(status);
  }
}
