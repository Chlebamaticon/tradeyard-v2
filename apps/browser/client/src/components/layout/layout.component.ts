import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbLayoutModule } from '@nebular/theme';

import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  standalone: true,
  imports: [NbLayoutModule, RouterModule, NavigationComponent],
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {}
