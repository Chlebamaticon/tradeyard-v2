import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NbCardModule, NbSpinnerModule } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NbCardModule, NbSpinnerModule],
  selector: 'app-merchant-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class MerchantSignUpPage {
  form = this.formBuilder.group({
    email: this.formBuilder.control(''),
    password: this.formBuilder.control(''),
    confirm_password: this.formBuilder.control(''),
  });

  readonly destroy$ = new EventEmitter<void>();
  readonly submit$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(readonly formBuilder: FormBuilder) {}
}
