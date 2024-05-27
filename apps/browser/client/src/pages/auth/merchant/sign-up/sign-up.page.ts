import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
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
  firstValueFrom,
  map,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import { AuthService } from '../../../../modules/auth';
import { matchValidator } from '../../../../modules/form';
import { OnDestroyNotifier$ } from '../../../../providers';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbIconModule,
    NbEvaIconsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSpinnerModule,
  ],
  selector: 'app-merchant-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  providers: [OnDestroyNotifier$],
})
export class MerchantSignUpPage {
  form = this.formBuilder.group({
    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    first_name: this.formBuilder.nonNullable.control('', [Validators.required]),
    last_name: this.formBuilder.nonNullable.control('', [Validators.required]),
    password: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
      matchValidator('confirm_password', true),
    ]),
    confirm_password: this.formBuilder.nonNullable.control('', [
      Validators.required,
      matchValidator('password'),
    ]),
  });

  readonly submit$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);

  readonly signupUponSubmit = this.submit$
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
      exhaustMap(
        async ([, formData]) =>
          await firstValueFrom(
            this.authService.signUp({ type: 'merchant', ...formData })
          )
      ),
      tap(() => this.loading$.next(false)),
      tap(() => this.router.navigateByUrl('/')),
      takeUntil(this.destroy$)
    )
    .subscribe();

  constructor(
    readonly router: Router,
    readonly formBuilder: FormBuilder,
    readonly authService: AuthService,
    readonly destroy$: OnDestroyNotifier$
  ) {}
}
