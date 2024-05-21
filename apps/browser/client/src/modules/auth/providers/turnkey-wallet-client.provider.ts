import { inject, InjectionToken } from '@angular/core';
import { exhaustMap, from, map, Observable } from 'rxjs';

import { AuthTurnkeyService } from '../services';

import { TurnkeyAccount } from './turnkey-account.provider';

export type TurnkeyWalletClientType = ReturnType<
  AuthTurnkeyService['createTurnkeyWalletClient']
> extends Promise<infer T>
  ? T
  : never;

export const TurnkeyWalletClient = new InjectionToken<
  Observable<TurnkeyWalletClientType>
>('turnkey:wallet:client', {
  factory: () => {
    const account = inject(TurnkeyAccount);
    const turnkey = inject(AuthTurnkeyService);
    return account.pipe(
      exhaustMap((account) => turnkey.createTurnkeyWalletClient(account))
    );
  },
});
