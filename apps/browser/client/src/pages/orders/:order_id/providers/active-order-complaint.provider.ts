import { InjectionToken, inject } from '@angular/core';

import { ComplaintDto } from '@tradeyard-v2/api-dtos';

import { ActiveOrder } from './active-order.provider';

export const ActiveOrderComplaint = new InjectionToken('ActiveOrderComplaint', {
  providedIn: 'any',
  factory: (): Promise<ComplaintDto | null> => {
    const activeOrder = inject(ActiveOrder);
    return activeOrder.then(({ complaints }) =>
      complaints ? complaints[0] : null
    );
  },
});
