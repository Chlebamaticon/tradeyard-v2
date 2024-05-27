import { inject, InjectionToken } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, firstValueFrom, map, shareReplay, switchMap } from 'rxjs';

import { OrderDto } from '@tradeyard-v2/api-dtos';

import { collectPathParamsWithActivatedRoute } from '../../../../helpers';
import { OrderApiService } from '../../../../modules/api/services';

export const ActiveOrder = new InjectionToken('ActiveOrder', {
  providedIn: 'any',
  factory: (): Promise<OrderDto> => {
    const activatedRoute = inject(ActivatedRoute);
    const orderApiService = inject(OrderApiService);
    console.log(activatedRoute);
    return firstValueFrom(
      collectPathParamsWithActivatedRoute(activatedRoute).pipe(
        map(({ order_id }) => order_id),
        filter((order_id) => !!order_id),
        switchMap((order_id) => orderApiService.one({ order_id })),
        shareReplay(1)
      )
    );
  },
});
