import { InjectionToken, inject } from '@angular/core';
import { Address, getAddress } from 'viem';

import { ActiveOrder } from './active-order.provider';

export const ActiveOrderContractAddress = new InjectionToken(
  'ActiveOrderContractAddress',
  {
    providedIn: 'any',
    factory: (): Promise<Address> => {
      const activeOrder = inject(ActiveOrder);
      return activeOrder.then(({ contract }) => getAddress(contract.address));
    },
  }
);
