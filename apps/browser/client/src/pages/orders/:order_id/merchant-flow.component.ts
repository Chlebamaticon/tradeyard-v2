import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  NbButtonModule,
  NbCardModule,
  NbStepComponent,
  NbStepperComponent,
  NbStepperModule,
} from '@nebular/theme';
import { tap, map, switchMap, withLatestFrom, firstValueFrom } from 'rxjs';

import { OrderStatus } from '@tradeyard-v2/api-dtos';

import { AuthService } from '../../../modules/auth';
import { UnitPipe } from '../../../pipes/unit.pipe';

import {
  MerchantStep,
  merchantStepToCompleted,
  merchantStepToStatus,
} from './constants/steps';
import { BaseContract, MerchantContract } from './contracts';

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

  readonly depositAmount$ = this.baseContract.getOrderTokenAmount();
  readonly status$ = this.baseContract.getStatus();

  readonly activeStep$ = this.status$.pipe(
    map((status) =>
      Object.keys(merchantStepToStatus).find((step) =>
        merchantStepToStatus[step as MerchantStep].includes(status)
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

  isCompleted(step: MerchantStep, currentStatus: OrderStatus): boolean {
    return merchantStepToCompleted[step].includes(currentStatus);
  }
}
