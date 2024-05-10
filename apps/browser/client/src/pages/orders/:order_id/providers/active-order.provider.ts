import { inject, InjectionToken } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  filter,
  firstValueFrom,
  map,
  merge,
  shareReplay,
  scan,
  Observable,
  switchMap,
} from 'rxjs';

import { OrderDto } from '@tradeyard-v2/api-dtos';

import { OrderApiService } from '../../../../modules/api/services';

const collectParams$ = (
  activatedRoute: ActivatedRoute
): Observable<Record<string, string>> => {
  let currentRoute: ActivatedRoute | null = activatedRoute;
  const params$ = [];
  while (currentRoute) {
    params$.push(currentRoute.params);
    currentRoute = currentRoute.firstChild;
  }
  return merge(...params$).pipe(
    scan((acc, params) => ({ ...acc, ...params }), {})
  );
};

export const ActiveOrder = new InjectionToken('ActiveOrder', {
  providedIn: 'any',
  factory: (): Promise<OrderDto> => {
    const activatedRoute = inject(ActivatedRoute);
    const orderApiService = inject(OrderApiService);
    return firstValueFrom(
      collectParams$(activatedRoute).pipe(
        map(({ order_id }) => order_id),
        filter((order_id) => !!order_id),
        switchMap((order_id) => orderApiService.one({ order_id })),
        shareReplay(1)
      )
    );
  },
});
