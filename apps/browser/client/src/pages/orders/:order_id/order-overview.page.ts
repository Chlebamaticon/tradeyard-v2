import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Self } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NbCardModule, NbStepperModule } from '@nebular/theme';
import { exhaustMap, merge } from 'rxjs';

import { AuthApiService, OrderApiService } from '../../../modules/api/services';
import { OnDestroyNotifier$ } from '../../../providers';

import { BaseContract } from './contracts/base-contract.class';
import { CustomerFlowComponent } from './customer-flow.component';
import { MerchantFlowComponent } from './merchant-flow.component';

@Component({
  standalone: true,
  selector: 'app-order-overview-page',
  templateUrl: './order-overview.page.html',
  styleUrls: ['./order-overview.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbStepperModule,
    CustomerFlowComponent,
    MerchantFlowComponent,
  ],
  providers: [BaseContract, OnDestroyNotifier$],
})
export class OrderOverviewPage {
  readonly init$ = new EventEmitter<void>();

  readonly order$ = merge(this.router.params).pipe(
    exhaustMap(({ order_id }) => this.orderApiService.one({ order_id }))
  );

  readonly whoami$ = this.authApiService.whoami();

  constructor(
    readonly router: ActivatedRoute,
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly authApiService: AuthApiService,
    readonly orderApiService: OrderApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
