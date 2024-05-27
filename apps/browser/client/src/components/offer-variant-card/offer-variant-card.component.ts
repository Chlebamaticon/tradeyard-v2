import { CommonModule } from '@angular/common';
import { Component, Inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
} from '@nebular/theme';
import { combineLatest, Observable, tap } from 'rxjs';

import {
  GetWhoamiDto,
  OfferDto,
  OfferVariantDto,
  TokenDto,
} from '@tradeyard-v2/api-dtos';

import { Whoami } from '../../modules/auth';
import { TokenSelectComponent } from '../token-select';

@Component({
  standalone: true,
  selector: 'app-offer-variant-card',
  templateUrl: './offer-variant-card.component.html',
  styleUrls: ['./offer-variant-card.component.scss'],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    NbInputModule,
    NbButtonGroupModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbFormFieldModule,
    NbEvaIconsModule,
    TokenSelectComponent,
  ],
})
export class OfferVariantCardComponent {
  offer = input<OfferDto>();
  variant = input<OfferVariantDto>();
  removable = input<boolean>();

  editMode = signal(false);
  group = this.builder.group({
    offer_variant_id: this.builder.nonNullable.control(''),
    title: this.builder.nonNullable.control(''),
    description: this.builder.nonNullable.control(''),
    price: this.builder.nonNullable.group({
      amount: this.builder.nonNullable.control(0),
      token: this.builder.nonNullable.control(''),
    }),
  });

  remove = output<OfferVariantDto>();
  submit = output<ReturnType<typeof this.group.getRawValue>>();

  data$ = combineLatest({
    editMode: toObservable(this.editMode),
    offer: toObservable(this.offer),
    variant: toObservable(this.variant),
    whoami: this.whoami,
    removable: toObservable(this.removable),
  });

  toggleEditMode(forceValue?: boolean) {
    this.editMode.update((value) =>
      forceValue === undefined ? !value : forceValue
    );
  }

  readonly prefillGroupWithCurrentValues = this.data$
    .pipe(
      tap(({ offer, variant }) =>
        this.group.patchValue({
          offer_variant_id: variant?.offer_variant_id,
          title: variant?.title || offer?.title,
          description: variant?.description || offer?.description,
          price: {
            amount: variant?.current_price?.amount,
            token: variant?.current_price?.token?.symbol,
          },
        })
      ),
      takeUntilDestroyed()
    )
    .subscribe();

  constructor(
    readonly builder: FormBuilder,
    @Inject(Whoami) readonly whoami: Observable<GetWhoamiDto>
  ) {}

  save() {
    this.submit.emit(this.group.getRawValue());
    this.toggleEditMode(false);
  }

  parseTokenToValue(token: TokenDto) {
    return token.symbol;
  }

  parseValueToToken(tokens: TokenDto[], value: unknown) {
    return tokens.find((token) => token.symbol === value);
  }
}
