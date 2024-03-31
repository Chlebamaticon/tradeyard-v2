import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NbCardModule, NbLayoutModule, NbListModule } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, NbLayoutModule, NbListModule, NbCardModule],
  selector: 'app-offers-explore-page',
  templateUrl: './offers-explore.page.html',
  styleUrls: ['./offers-explore.page.scss'],
})
export class OffersExplorePage {
  offers$ = new BehaviorSubject<any[]>([
    {
      id: 1,
      title: 'Offer 1',
      description: 'Description 1',
      thumbnailUrl: 'https://picsum.photos/200/150',
    },
  ]);
}
