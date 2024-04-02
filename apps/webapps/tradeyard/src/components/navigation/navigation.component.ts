import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbActionsModule } from '@nebular/theme';

@Component({
  standalone: true,
  imports: [RouterModule, NbActionsModule],
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {}
