import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TurnkeyWalletClient } from '../providers';

export const ConnectedOnly: CanActivateFn = async () => {
  const walletClient = inject(TurnkeyWalletClient);

  try {
    await firstValueFrom(walletClient);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
