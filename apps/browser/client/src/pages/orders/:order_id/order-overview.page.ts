import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  Self,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogService,
  NbStepperModule,
} from '@nebular/theme';
import {
  combineLatest,
  exhaustMap,
  map,
  merge,
  Observable,
  filter,
} from 'rxjs';

import { GetWhoamiDto, OrderStatus } from '@tradeyard-v2/api-dtos';

import {
  AuthApiService,
  ComplaintApiService,
  OrderApiService,
} from '../../../modules/api/services';
import { Whoami } from '../../../modules/auth';
import { OnDestroyNotifier$ } from '../../../providers';

import { CreateComplaintDialogComponent } from './create-complaint-dialog.component';
import { CustomerFlowComponent } from './customer-flow.component';
import { BaseContractFacade } from './facades/base-contract.facade';
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
    CreateComplaintDialogComponent,
  ],
  providers: [BaseContractFacade, OnDestroyNotifier$],
  encapsulation: ViewEncapsulation.None,
})
export class OrderOverviewPage {
  readonly status$ = this.baseContract.getStatus();
  readonly data$ = combineLatest({
    order: merge(this.router.params).pipe(
      exhaustMap(({ order_id }) => this.orderApiService.one({ order_id }))
    ),
    whoami: this.whoami.pipe(filter(Boolean)),
  });

  readonly isNotComplaint$ = this.status$.pipe(
    map(
      (status) =>
        ![
          OrderStatus.CustomerComplaint,
          OrderStatus.MerchantComplaint,
        ].includes(status)
    )
  );

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
    @Inject(Whoami)
    readonly whoami: Observable<GetWhoamiDto | null>,
    readonly router: ActivatedRoute,
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly authApiService: AuthApiService,
    readonly orderApiService: OrderApiService,
    readonly baseContract: BaseContractFacade,
    readonly complaintApiService: ComplaintApiService,
    readonly dialogService: NbDialogService
  ) {}

  /**
   * @todo Once we start using turnkey wallet instead of the static one,
   * this method can be slimmed to just one.
   * `complaint` method at contract distinguish sides automatically.
   */
  async submitComplaintAsCustomer() {
    this.dialogService.open(CreateComplaintDialogComponent, {
      dialogClass: 'dialog',
      context: {
        flow: this.customerFlow(),
        orderId: this.router.snapshot.params['order_id'],
      },
    });
  }

  async submitComplaintAsMerchant() {
    this.dialogService.open(CreateComplaintDialogComponent, {
      dialogClass: 'dialog',
      context: {
        flow: this.merchantFlow(),
        orderId: this.router.snapshot.params['order_id'],
      },
    });
  }
}
