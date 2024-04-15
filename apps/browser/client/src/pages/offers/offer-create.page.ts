import { Component, EventEmitter, Self } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';

import { CreateOfferBody, TokenDto } from '@tradeyard-v2/api-dtos';

import { TokenSelectComponent } from '../../components/token-select/token-select.component';
import { OfferApiService } from '../../modules/api/services';
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
    TokenSelectComponent,
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
        token: this.builder.control(''),
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
      withLatestFrom(this.form.valueChanges, this.form.statusChanges),
      filter(([_, __, status]) => status === 'VALID'),
      map(([, values]) => CreateOfferBody.parse(values)),
      exhaustMap((values) => this.offerApiService.create(values)),
      tap(() => this.form.reset()),
      tap(() => this.router.navigateByUrl('/offers')),
      takeUntil(this.destroy$)
    )
    .subscribe();

  constructor(
    readonly router: Router,
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

  parseTokenToValue(token: TokenDto) {
    return token.symbol;
  }

  parseValueToToken(tokens: TokenDto[], value: unknown) {
    return tokens.find((token) => token.symbol === value);
  }

  save() {
    this.save$.emit();
  }
}
