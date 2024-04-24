import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const UnauthenticatedOnly: CanActivateFn = async () => {
  const { accessToken } = inject(AuthService);
  const router = inject(Router);

  if (accessToken) {
    return router.parseUrl('/');
  }

  return true;
};
