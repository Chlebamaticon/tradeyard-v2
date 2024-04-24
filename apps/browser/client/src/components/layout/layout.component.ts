import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbLayoutModule } from '@nebular/theme';

import { AuthApiService } from '../../modules/api/services';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  standalone: true,
  imports: [NbLayoutModule, RouterModule, NavigationComponent],
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent {
  constructor(readonly authApi: AuthApiService) {}

  ngOnInit(): void {
    this.authApi.whoami();
  }
}
