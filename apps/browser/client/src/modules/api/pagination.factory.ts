import {
  BehaviorSubject,
  combineLatest,
  exhaustMap,
  NEVER,
  Observable,
  of,
  scan,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { Pagination } from '@tradeyard-v2/api-dtos';

export type PaginationParams = { offset?: number; limit?: number };
export type PaginationSearchParams = { timestamp: number };
export interface PaginationNotifierInit {
  initNotifier?: Observable<void>;
  destroyNotifier?: Observable<void>;
}

export type PaginationInit = {
  initialParams: PaginationParams & PaginationSearchParams;
} & PaginationNotifierInit;

export type PaginationResponse<T = unknown> = Omit<Pagination, 'items'> & {
  items: T[];
};

export interface PaginationOptions<
  T = unknown,
  SearchParams extends object = object
> extends PaginationNotifierInit {
  initialParams: PaginationParams;
  initialSearch: SearchParams & PaginationSearchParams;
  request: (
    search: SearchParams,
    params: PaginationParams
  ) => Observable<PaginationResponse<T>>;
}

export interface PaginationControls<
  T = unknown,
  SearchParams extends object = object
> {
  data$: Observable<PaginationResponse<T>>;
  search: (searchParams: SearchParams) => void;
  next: () => void;
}

export function pagination<T = unknown, SearchParams extends object = object>({
  initialParams,
  initialSearch,
  initNotifier,
  destroyNotifier,
  request,
}: PaginationOptions<T, SearchParams>): PaginationControls<T, SearchParams> {
  const params$ = new BehaviorSubject<PaginationParams>({ ...initialParams });
  const search$ = new BehaviorSubject<SearchParams>({ ...initialSearch });
  const loading$ = new BehaviorSubject<boolean>(false);
  const fetching$ = new BehaviorSubject<boolean>(false);
  const initOrInstant$ = initNotifier ?? of(void 0);

  const data$ = combineLatest([search$, initOrInstant$]).pipe(
    tap(() => loading$.next(true)),
    switchMap(([searchParams]) =>
      params$.pipe(
        tap(() => fetching$.next(true)),
        exhaustMap((paginationParams) =>
          request(searchParams, paginationParams).pipe(
            takeUntil(destroyNotifier ?? NEVER)
          )
        ),
        scan(
          (
            acc: PaginationResponse<T>,
            { items, total, timestamp, offset, limit }
          ) => ({
            ...acc,
            items: [...acc.items, ...items],
            total,
            timestamp,
            offset: Math.min(acc.offset ?? 0, offset ?? 0),
            limit,
          }),
          {
            items: [],
            total: 0,
          }
        ),
        tap(() => fetching$.next(false))
      )
    ),
    tap(() => loading$.next(false)),
    takeUntil(destroyNotifier ?? NEVER)
  );

  return {
    data$,
    search: (searchParams: SearchParams) => search$.next(searchParams),
    next: () => {
      const { limit = 20 } = initialParams;
      params$.next({
        offset: (params$.value.offset ?? 0) + limit,
        limit,
      });
    },
  };
}
