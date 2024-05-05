import { inject, InjectionToken } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  filter,
  firstValueFrom,
  map,
  merge,
  shareReplay,
  switchMap,
  scan,
  Observable,
} from 'rxjs';
import { Address, getAddress } from 'viem';

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

export const OrderContractAddress = new InjectionToken('OrderContractAddress', {
  providedIn: 'any',
  factory: (): Promise<Address> => {
    const activatedRoute = inject(ActivatedRoute);
    const orders = inject(OrderApiService);
    return firstValueFrom(
      collectParams$(activatedRoute).pipe(
        map(({ order_id }) => order_id),
        filter((order_id) => !!order_id),
        switchMap((order_id) => orders.one({ order_id })),
        map(({ contract }) => getAddress(contract.address)),
        shareReplay(1)
      )
    );
  },
});
