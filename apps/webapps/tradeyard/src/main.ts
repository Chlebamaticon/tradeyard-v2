import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { Buffer } from 'buffer/';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log(Buffer);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.Buffer = Buffer as any;

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
