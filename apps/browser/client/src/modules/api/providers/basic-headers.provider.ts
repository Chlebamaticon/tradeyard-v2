import { EventEmitter, inject, InjectionToken } from '@angular/core';
import { merge, Observable, scan, shareReplay } from 'rxjs';

export const BasicHeaderEmitter = new InjectionToken<
  EventEmitter<Record<string, string | string[]>>
>('http:headers:basic:setter', {
  factory: () => new EventEmitter<Record<string, string | string[]>>(),
});

export const BasicHeaders = new InjectionToken<
  Observable<Record<string, string | string[]>>
>('http:headers:basic', {
  factory: () =>
    merge(inject(BasicHeaderEmitter)).pipe(
      scan(
        (acc, headers) => ({
          ...acc,
          ...headers,
        }),
        {}
      ),
      shareReplay(1)
    ),
});
