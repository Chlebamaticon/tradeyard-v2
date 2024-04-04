import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbLayoutModule,
} from '@nebular/theme';

@Component({
  standalone: true,
  imports: [RouterModule, NbLayoutModule, NbButtonGroupModule, NbButtonModule],
  selector: 'app-offers-page',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage {}
