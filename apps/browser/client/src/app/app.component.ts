import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthModule } from '../modules/auth';

@Component({
  standalone: true,
  imports: [AuthModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tradeyard';
}
