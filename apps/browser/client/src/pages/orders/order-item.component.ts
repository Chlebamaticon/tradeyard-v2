import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbSpinnerModule, NbTagModule } from '@nebular/theme';
import { exhaustMap, filter, map, tap } from 'rxjs';
import { getAddress } from 'viem';

import { currentChain, OrderDto, OrderStatus } from '@tradeyard-v2/api-dtos';

import { BaseContract } from './base-contract.facade';

@Component({
  standalone: true,
  selector: 'app-order-item',
  template: `
    @if(order$ | async; as order) {
    <nb-card [routerLink]="['/orders', order.order_id]">
      <nb-card-body>
        <div class="header">
          <h6>
            {{ order.offer_variant.title || order.offer.title }}
          </h6>
          <nb-tag
            size="tiny"
            appearance="outline"
            [text]="(status$ | async) ?? 'loading...'"
          />
          <a [href]="getExplorerUrl(order.contract.address)" target="_blank"
            ><nb-tag
              size="tiny"
              appearance="outline"
              [text]="
                'explore ' +
                (order.contract.address | slice : 0 : 5) +
                '...' +
                (order.contract.address | slice : -3)
              "
          /></a>
        </div>
        <div class="body">
          <p>
            {{ order.offer_variant.description || order.offer.description }}
          </p>
        </div>
      </nb-card-body>
    </nb-card>
    }
  `,
  styleUrls: ['./order-item.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NbCardModule,
    NbTagModule,
    NbSpinnerModule,
  ],
})
export class OrderItemComponent {
  pending = signal(false);
  pending$ = toObservable(this.pending);

  order = input<OrderDto>();
  order$ = toObservable(this.order);

  status$ = this.order$.pipe(
    filter(Boolean),
    tap(() => this.pending.set(true)),
    exhaustMap(({ contract }) =>
      this.baseContract.getStatus(getAddress(contract.address))
    ),
    map((status) => OrderStatus[status]),
    tap(() => this.pending.set(false))
  );

  constructor(readonly baseContract: BaseContract) {}

  getExplorerUrl(address: string) {
    const { blockExplorers } = currentChain;
    return `${blockExplorers.default.url}/address/${address}`;
  }
}
