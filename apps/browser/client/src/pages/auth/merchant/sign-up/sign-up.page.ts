import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbInputModule,
  NbSpinnerModule,
} from '@nebular/theme';
import {
  BehaviorSubject,
  exhaustMap,
  filter,
  map,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import { AuthService } from '../../../../modules/auth';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSpinnerModule,
  ],
  selector: 'app-merchant-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class MerchantSignUpPage {
  form = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required]),
  });

  readonly destroy$ = new EventEmitter<void>();
  readonly submit$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly signupOnSubmit$ = this.submit$
    .pipe(
      withLatestFrom(this.form.statusChanges, this.form.valueChanges),
      filter(([, status]) => status === 'VALID'),
      map(([, , formData]) => formData),
      tap(() => this.loading$.next(true)),
      exhaustMap((formData) =>
        this.auth
          .signupWithEmail(formData.email!)
          .catch((error) => console.warn(error))
      ),
      takeUntil(this.destroy$),
      tap(() => this.loading$.next(false))
    )
    .subscribe();

  constructor(readonly formBuilder: FormBuilder, readonly auth: AuthService) {}
}
