import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbLayoutModule } from '@nebular/theme';

@Component({
  standalone: true,
  selector: 'app-customer-auth-page',
  imports: [NbLayoutModule, RouterModule],
  template: `
    <nb-layout center [withScroll]="false">
      <nb-layout-column class="container">
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>
  `,
  styleUrls: ['./customer-auth.page.scss'],
})
export class CustomerAuthPage {}
