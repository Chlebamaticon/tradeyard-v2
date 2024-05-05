import { CommonModule } from '@angular/common';
import {
  Component,
  contentChild,
  EventEmitter,
  Self,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  NbButton,
  NbButtonModule,
  NbCardModule,
  NbStepperModule,
} from '@nebular/theme';
import { combineLatest, exhaustMap, merge } from 'rxjs';

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
    NbButtonModule,
    NbCardModule,
    NbStepperModule,
    CustomerFlowComponent,
    MerchantFlowComponent,
  ],
  providers: [BaseContract, OnDestroyNotifier$],
})
export class OrderOverviewPage {
  readonly data$ = combineLatest({
    order: merge(this.router.params).pipe(
      exhaustMap(({ order_id }) => this.orderApiService.one({ order_id }))
    ),
    whoami: this.authApiService.whoami(),
  });

  readonly customerFlow = viewChild('customerFlow', {
    read: CustomerFlowComponent,
  });
  readonly merchantFlow = viewChild('merchantFlow', {
    read: MerchantFlowComponent,
  });

  constructor(
    readonly router: ActivatedRoute,
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly authApiService: AuthApiService,
    readonly orderApiService: OrderApiService
  ) {}

  /**
   * @todo Once we start using turnkey wallet instead of the static one,
   * this method can be slimmed to just one.
   * `complaint` method at contract distinguish sides automatically.
   */
  async submitComplaintAsCustomer() {
    const customerFlow = this.customerFlow();
    console.log(this.customerFlow());
    if (!customerFlow) return;
    await customerFlow.complaint();
  }

  async submitComplaintAsMerchant() {
    const merchantFlow = this.customerFlow();
    if (!merchantFlow) return;
    await merchantFlow.complaint();
  }
}
