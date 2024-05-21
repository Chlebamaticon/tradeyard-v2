import { inject, InjectionToken } from '@angular/core';
import { exhaustMap, filter, Observable } from 'rxjs';
import { LocalAccount } from 'viem';

import { AuthTurnkeyService } from '../services';

import { Whoami } from './whoami.provider';

export const TurnkeyAccount = new InjectionToken<Observable<LocalAccount>>(
  'turnkey:account',
  {
    factory: () => {
      const whoami = inject(Whoami);
      const turnkey = inject(AuthTurnkeyService);
      return whoami.pipe(
        filter(Boolean),
        exhaustMap((user) => {
          const { wallets } = user;
          const [{ address, sub_organization_id }] = wallets;
          return turnkey.createTurnkeyAccount({ address, sub_organization_id });
        })
      );
    },
  }
);
