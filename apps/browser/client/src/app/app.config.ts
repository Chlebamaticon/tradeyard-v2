import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NbThemeModule } from '@nebular/theme';

import { AuthModule } from '../modules/auth';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    importProvidersFrom(NbThemeModule.forRoot({ name: 'default' })),
    importProvidersFrom(AuthModule),
  ],
};
