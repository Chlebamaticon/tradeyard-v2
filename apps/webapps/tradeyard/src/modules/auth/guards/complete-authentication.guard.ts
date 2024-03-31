import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const CompleteAuthentication: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log(await auth.signer.getAuthDetails().catch(() => null));

  const { bundle, orgId } = route.queryParams;
  if (bundle && orgId) {
    await auth.completeAuthentication(bundle, orgId);
    return router.parseUrl('/');
  }

  return true;
};
