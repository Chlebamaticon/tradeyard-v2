import { Component } from '@angular/core';
import { NbCardModule, NbInputModule } from '@nebular/theme';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [NbCardModule, NbInputModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {}
