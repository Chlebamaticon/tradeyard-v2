import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { OrderApiService } from '../../modules/api/services';

export const OrderExist: CanActivateFn = (route) => {
  const orderApiService = inject(OrderApiService);
  const router = inject(Router);

  return firstValueFrom(
    orderApiService.one({ order_id: route.params['order_id'] })
  )
    .then(() => true)
    .catch(() => router.createUrlTree(['/orders']));
};
