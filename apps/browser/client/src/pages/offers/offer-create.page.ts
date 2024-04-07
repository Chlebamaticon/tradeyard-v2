import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbAccordionModule,
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
} from '@nebular/theme';
import {
  BehaviorSubject,
  combineLatest,
  exhaustMap,
  filter,
  map,
  withLatestFrom,
} from 'rxjs';

import { CreateOfferBody } from '@tradeyard-v2/api-dtos';

import { OfferApiService } from '../../modules/offer';

@Component({
  standalone: true,
  imports: [
    NbAccordionModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
    NbEvaIconsModule,
    NbIconModule,
    NbInputModule,
    ReactiveFormsModule,
  ],
  selector: 'app-offer-create-page',
  templateUrl: './offer-create.page.html',
  styleUrls: ['./offer-create.page.scss'],
})
export class OfferCreatePage {
  readonly variants = this.builder.array([
    this.builder.group({
      title: this.builder.control(''),
      description: this.builder.control(''),
      price: this.builder.control(''),
    }),
  ]);

  readonly save$ = new EventEmitter<void>();
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly form = this.builder.group({
    title: this.builder.control(''),
    description: this.builder.control(''),
    variants: this.variants,
  });

  readonly sumbitUponSave$ = this.save$.pipe(
    withLatestFrom(
      combineLatest([this.form.valueChanges, this.form.statusChanges])
    ),
    filter(([, [, status]]) => status === 'VALID'),
    map(([, [values]]) => CreateOfferBody.parse(values)),
    exhaustMap((values) => this.offerApiService.create(values))
  );

  constructor(
    readonly builder: FormBuilder,
    readonly offerApiService: OfferApiService
  ) {}

  addVariant() {
    this.variants.push(
      this.builder.group({
        title: this.builder.control(''),
        description: this.builder.control(''),
        price: this.builder.control(''),
      })
    );
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }
}
