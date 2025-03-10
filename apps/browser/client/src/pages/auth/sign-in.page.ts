import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
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
    RouterModule,
    ReactiveFormsModule,
    NbIconModule,
    NbEvaIconsModule,
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
