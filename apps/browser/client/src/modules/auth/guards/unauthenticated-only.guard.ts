import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const UnauthenticatedOnly: CanActivateFn = async () => {
  const { signer } = inject(AuthService);
  const router = inject(Router);
  try {
    await signer.getAuthDetails();
    return router.parseUrl('/');
  } catch (error) {
    return true;
  }
};
