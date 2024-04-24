import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbInputModule,
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
    email: this.formBuilder.nonNullable.control(''),
    password: this.formBuilder.nonNullable.control(''),
    params: this.formBuilder.group({
      bundle: this.formBuilder.control(''),
      orgId: this.formBuilder.control(''),
    }),
  });

  readonly destroy$ = new EventEmitter<void>();
  readonly submit$ = new EventEmitter<void>();
  readonly passkey$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly authenticateUponPasskey$ = this.passkey$
    .pipe(
      tap(() => this.loading$.next(true)),
      exhaustMap(() =>
        this.auth
          .authenticateWithPasskey()
          .catch((error) => console.warn(error))
      ),
      takeUntil(this.destroy$),
      tap(() => this.loading$.next(false))
    )
    .subscribe();
  readonly authenticateUponSubmit$ = this.submit$
    .pipe(
      withLatestFrom(
        combineLatest([this.form.statusChanges, this.form.valueChanges]).pipe(
          filter(([status]) => status === 'VALID'),
          map(([, formData]) => formData),
          filter(
            (formData): formData is Required<typeof formData> => !!formData
          )
        )
      ),
      tap(() => this.loading$.next(true)),
      exhaustMap(([, formData]) =>
        this.auth.signIn({
          email: formData.email,
          password: formData.password,
        })
      ),
      takeUntil(this.destroy$),
      tap(() => this.loading$.next(false)),
      tap(() => this.router.navigateByUrl('/'))
    )
    .subscribe();

  constructor(
    readonly formBuilder: FormBuilder,
    readonly auth: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.emit();
    this.destroy$.complete();
  }
}
