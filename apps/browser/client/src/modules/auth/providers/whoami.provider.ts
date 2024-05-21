import { inject, InjectionToken } from '@angular/core';
import { exhaustMap, merge, Observable, of } from 'rxjs';

import { GetWhoamiDto } from '@tradeyard-v2/api-dtos';

import { AuthApiService } from '../../api/services';
import { AuthService } from '../services';

export const Whoami = new InjectionToken<Observable<GetWhoamiDto | null>>(
  'user:whoami',
  {
    factory: () => {
      const authService = inject(AuthService);
      const authApiService = inject(AuthApiService);
      return merge(
        of(authService.accessToken),
        authService.accessTokenChanges
      ).pipe(
        exhaustMap((accessToken) =>
          accessToken ? authApiService.whoami() : of(null)
        )
      );
    },
  }
);
