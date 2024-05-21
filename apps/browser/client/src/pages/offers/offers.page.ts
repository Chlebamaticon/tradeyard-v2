import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbLayoutModule,
} from '@nebular/theme';
import { combineLatest, Observable } from 'rxjs';

import { GetWhoamiDto } from '@tradeyard-v2/api-dtos';

import { Whoami } from '../../modules/auth';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbLayoutModule,
    NbButtonGroupModule,
    NbButtonModule,
  ],
  selector: 'app-offers-page',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage {
  readonly data$ = combineLatest({
    whoami: this.whoami,
  });

  constructor(@Inject(Whoami) readonly whoami: Observable<GetWhoamiDto>) {}
}
