import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const AuthenticatedOnly: CanActivateFn = async () => {
  const { accessToken } = inject(AuthService);
  const router = inject(Router);

  if (accessToken) {
    return true;
  }

  return router.parseUrl('/auth');
};
