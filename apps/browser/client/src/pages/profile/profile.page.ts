import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NbButtonModule, NbLayoutModule } from '@nebular/theme';

import { AuthService } from '../../modules/auth';

@Component({
  standalone: true,
  imports: [NbButtonModule, NbLayoutModule, RouterModule],
  selector: 'app-profile-page',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  constructor(private router: Router, private auth: AuthService) {}

  onSignOut() {
    this.auth.signOut();

    this.router.navigateByUrl('/auth');
  }
}
