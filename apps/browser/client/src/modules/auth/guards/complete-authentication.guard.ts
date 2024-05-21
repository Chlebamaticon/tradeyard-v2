import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Whoami } from '../providers';

export const CompleteAuthentication: CanActivateFn = async () => {
  const router = inject(Router);
  const whoami = inject(Whoami);

  return firstValueFrom(whoami).then((whoami) =>
    whoami ? true : router.parseUrl('/auth/login')
  );
};
