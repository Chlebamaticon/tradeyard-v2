import { EventEmitter } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  defaultIfEmpty,
  EMPTY,
  exhaustMap,
  merge,
  NEVER,
  Observable,
  ObservableInput,
  of,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import { Pagination } from '@tradeyard-v2/api-dtos';

export type PaginationParams = { offset?: number; limit?: number };
export type PaginationSearchParams = { timestamp: number };

export type PaginationTransformer<Input = unknown, Output = unknown> = (
  items: Input[]
) => Output[];

export interface PaginationNotifierInit<P = unknown> {
  paramsNotifier?: ObservableInput<P>;
  initNotifier?: Observable<void>;
  destroyNotifier?: Observable<void>;
}

export type PaginationInit<P = object> = {
  initialParams: PaginationParams & PaginationSearchParams;
} & PaginationNotifierInit<P>;

export type PaginationResponse<T = unknown> = Omit<Pagination, 'items'> & {
  items: T[];
};

export interface PaginationOptions<
  T = unknown,
  PathParams extends object = object,
  SearchParams extends object = object
> extends PaginationNotifierInit<PathParams> {
  initialPage: PaginationParams;
  initialSearch: SearchParams & PaginationSearchParams;
  request: (
    search: SearchParams,
    params: PathParams & PaginationParams
  ) => Observable<PaginationResponse<T>>;
}

export interface PaginationControls<
  T = unknown,
  SearchParams extends object = object
> {
  data: PaginationResponse<T>;
  data$: Observable<PaginationResponse<T>>;
  loading$: Observable<boolean>;
  fetching$: Observable<boolean>;
  search: (searchParams: SearchParams) => void;
  next: () => void;
  refresh: () => void;
}

export function pagination<
  ItemType = unknown,
  PathParams extends object = object,
  SearchParams extends object = object
>({
  initialPage,
  initialSearch,
  initNotifier,
  destroyNotifier,
  paramsNotifier,
  request,
}: PaginationOptions<ItemType, PathParams, SearchParams>): PaginationControls<
  ItemType,
  SearchParams
> {
  const data$ = new BehaviorSubject<PaginationResponse<ItemType>>({
    items: [],
    total: 0,
  });
  const page$ = new BehaviorSubject<PaginationParams>({ ...initialPage });
  const search$ = new BehaviorSubject<SearchParams>({ ...initialSearch });
  const loading$ = new BehaviorSubject<boolean>(false);
  const fetching$ = new BehaviorSubject<boolean>(false);
  const reset$ = new BehaviorSubject<void>(void 0);
  const params$ = paramsNotifier ?? of({} as PathParams);
  const initOrInstant$ = initNotifier ?? of(void 0);

  combineLatest([search$, params$, initOrInstant$, reset$])
    .pipe(
      tap(() => loading$.next(true)),
      switchMap(([searchParams, pathParams]) =>
        page$.pipe(
          tap(() => fetching$.next(true)),
          exhaustMap((paginationParams) =>
            request(searchParams, { ...paginationParams, ...pathParams }).pipe(
              takeUntil(destroyNotifier ?? NEVER)
            )
          ),
          scan(
            (
              acc: PaginationResponse<ItemType>,
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
    )
    .subscribe(data$);

  return {
    data: data$.value,
    data$,
    loading$: loading$.asObservable(),
    fetching$: fetching$.asObservable(),
    search: (searchParams: SearchParams) => search$.next(searchParams),
    next: () => {
      const { limit = 20 } = initialPage;
      page$.next({
        offset: (page$.value.offset ?? 0) + limit,
        limit,
      });
    },
    refresh: () => reset$.next(void 0),
  };
}
