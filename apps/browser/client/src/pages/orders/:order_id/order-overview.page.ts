import { CommonModule } from '@angular/common';
import { Component, Self, viewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule, NbStepperModule } from '@nebular/theme';
import { combineLatest, exhaustMap, firstValueFrom, merge } from 'rxjs';

import {
  AuthApiService,
  ComplaintApiService,
  OrderApiService,
} from '../../../modules/api/services';
import { OnDestroyNotifier$ } from '../../../providers';

import { CustomerFlowComponent } from './customer-flow.component';
import { BaseContract } from './facades/base-contract.facade';
import { MerchantFlowComponent } from './merchant-flow.component';
import { ModeratorFlowComponent } from './moderator-flow.component';

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
    ModeratorFlowComponent,
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
  readonly moderatorFlow = viewChild('moderatorFlow', {
    read: ModeratorFlowComponent,
  });

  constructor(
    readonly router: ActivatedRoute,
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly authApiService: AuthApiService,
    readonly orderApiService: OrderApiService,
    readonly complaintApiService: ComplaintApiService
  ) {}

  /**
   * @todo Once we start using turnkey wallet instead of the static one,
   * this method can be slimmed to just one.
   * `complaint` method at contract distinguish sides automatically.
   */
  async submitComplaintAsCustomer() {
    const customerFlow = this.customerFlow();

    if (!customerFlow) return;
    await customerFlow.complaint();
    const {
      snapshot: {
        params: { order_id },
      },
    } = this.router;
    await firstValueFrom(
      this.complaintApiService.create({
        order_id,
        body: `Something isn't right; I'd like to submit a complaint.`,
      })
    );
  }

  async submitComplaintAsMerchant() {
    const merchantFlow = this.customerFlow();
    if (!merchantFlow) return;
    await merchantFlow.complaint();
    const {
      snapshot: {
        params: { order_id },
      },
    } = this.router;
    await firstValueFrom(
      this.complaintApiService.create({
        order_id,
        body: `Something isn't right; I'd like to submit a complaint.`,
      })
    );
  }
}
