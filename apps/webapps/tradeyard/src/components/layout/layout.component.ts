import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbLayoutModule } from '@nebular/theme';

@Component({
  standalone: true,
  imports: [NbLayoutModule, RouterModule],
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {}
