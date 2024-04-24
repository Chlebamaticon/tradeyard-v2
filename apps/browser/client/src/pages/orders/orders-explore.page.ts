import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Self } from '@angular/core';
import { RouterModule } from '@angular/router';

import { OrderApiService } from '../../modules/api/services';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-orders-explore-page',
  templateUrl: './orders-explore.page.html',
  styleUrls: ['./orders-explore.page.scss'],
  providers: [OnDestroyNotifier$],
})
export class OrdersExplorePage implements AfterViewInit {
  readonly init$ = new EventEmitter<void>();

  readonly orders = this.orderApiService.many({
    initialParams: { offset: 0, limit: 20, timestamp: Date.now() },
    initNotifier: this.init$,
    destroyNotifier: this.destroy$,
  });

  constructor(
    @Self() readonly destroy$: OnDestroyNotifier$,
    readonly orderApiService: OrderApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }
}
