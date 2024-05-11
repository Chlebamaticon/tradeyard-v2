import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { NbDialogModule, NbThemeModule } from '@nebular/theme';

import { ApiModule } from '../modules/api';
import { AuthModule } from '../modules/auth';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    importProvidersFrom(NbThemeModule.forRoot({ name: 'default' })),
    importProvidersFrom(ApiModule),
    importProvidersFrom(AuthModule),
    importProvidersFrom(
      NbDialogModule.forRoot({
        hasBackdrop: true,
        closeOnBackdropClick: true,
      })
    ),
  ],
};
