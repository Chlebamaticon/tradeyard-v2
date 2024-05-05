import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbLayoutModule } from '@nebular/theme';

@Component({
  standalone: true,
  imports: [RouterModule, NbLayoutModule],
  selector: 'app-orders-page',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrdersPage {}
