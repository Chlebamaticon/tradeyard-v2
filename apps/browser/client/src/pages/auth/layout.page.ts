import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbCardModule, NbLayoutModule } from '@nebular/theme';

@Component({
  standalone: true,
  imports: [NbLayoutModule, NbCardModule, RouterModule],
  selector: 'app-auth-layout-page',
  template: ` <nb-layout center [withScroll]="false">
    <nb-layout-column class="container">
      <router-outlet></router-outlet>
    </nb-layout-column>
  </nb-layout>`,
  styleUrls: ['./layout.page.scss'],
})
export class AuthLayoutPage {}
