import { Component, EventEmitter, Inject, Self } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbAccordionModule,
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
} from '@nebular/theme';
import {
  BehaviorSubject,
  exhaustMap,
  filter,
  map,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import { CreateOfferBody } from '@tradeyard-v2/api-dtos';

import { OfferApiService } from '../../modules/offer';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  imports: [
    NbAccordionModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
    NbFormFieldModule,
    NbEvaIconsModule,
    NbIconModule,
    NbInputModule,
    ReactiveFormsModule,
  ],
  selector: 'app-offer-create-page',
  templateUrl: './offer-create.page.html',
  styleUrls: ['./offer-create.page.scss'],
  providers: [OnDestroyNotifier$],
})
export class OfferCreatePage {
  readonly variants = this.builder.array([
    this.builder.group({
      title: this.builder.control(''),
      description: this.builder.control(''),
      price: this.builder.group({
        amount: this.builder.control(''),
        token: this.builder.control('MATIC'),
      }),
    }),
  ]);

  readonly save$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly form = this.builder.group({
    title: this.builder.control('', { validators: [Validators.required] }),
    description: this.builder.control('', {
      validators: [Validators.required],
    }),
    variants: this.variants,
  });

  readonly sumbitUponSave$ = this.save$
    .pipe(
      tap(() => console.log('save!')),
      withLatestFrom(this.form.valueChanges, this.form.statusChanges),
      tap(console.log),
      filter(([_, __, status]) => status === 'VALID'),
      map(([, values]) => CreateOfferBody.parse(values)),
      exhaustMap((values) => this.offerApiService.create(values)),
      takeUntil(this.destroy$)
    )
    .subscribe();

  constructor(
    readonly builder: FormBuilder,
    readonly offerApiService: OfferApiService,
    @Self() readonly destroy$: OnDestroyNotifier$
  ) {}

  addVariant() {
    this.variants.push(
      this.builder.group({
        title: this.builder.control(''),
        description: this.builder.control(''),
        price: this.builder.group({
          amount: this.builder.control(''),
          token: this.builder.control('MATIC'),
        }),
      })
    );
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  save() {
    console.log('save pressed!');
    this.save$.emit();
  }
}
