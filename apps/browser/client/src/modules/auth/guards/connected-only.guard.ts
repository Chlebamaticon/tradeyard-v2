import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const ConnectedOnly: CanActivateFn = async () => {
  const authService = inject(AuthService);

  try {
    await authService.createOrUsePasskey();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
