import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const AuthenticatedOnly: CanActivateFn = async () => {
  const { signer } = inject(AuthService);
  const router = inject(Router);

  try {
    await signer.getAuthDetails();
    return true;
  } catch (error) {
    return router.parseUrl('/auth/sign-in');
  }
};
