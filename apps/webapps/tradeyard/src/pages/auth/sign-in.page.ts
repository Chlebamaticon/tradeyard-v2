import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbLayoutModule,
  NbSpinnerModule,
} from '@nebular/theme';
import {
  BehaviorSubject,
  combineLatest,
  exhaustMap,
  filter,
  map,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import { AuthService } from '../../modules/auth';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbLayoutModule,
    NbCardModule,
    NbInputModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbSpinnerModule,
  ],
  selector: 'app-sign-in-page',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnDestroy {
  form = this.formBuilder.group({
    email: this.formBuilder.control(''),
    params: this.formBuilder.group({
      bundle: this.formBuilder.control(''),
      orgId: this.formBuilder.control(''),
    }),
  });

  readonly destroy$ = new EventEmitter<void>();
  readonly submit$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly authenticateUponSubmit$ = this.submit$
    .pipe(
      withLatestFrom(
        combineLatest([this.form.statusChanges, this.form.valueChanges]).pipe(
          filter(([status]) => status === 'VALID'),
          map(([, formData]) => formData)
        )
      ),
      tap(() => this.loading$.next(true)),
      exhaustMap(([, formData]) => this.auth.authenticate(formData.email!)),
      tap(() => this.loading$.next(false)),
      takeUntil(this.destroy$)
    )
    .subscribe();

  constructor(readonly formBuilder: FormBuilder, readonly auth: AuthService) {}

  ngOnDestroy(): void {
    this.destroy$.emit();
    this.destroy$.complete();
  }
}
