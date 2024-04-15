import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { NbSelectModule } from '@nebular/theme';

import { TokenDto } from '@tradeyard-v2/api-dtos';

import { TokenApiService } from '../../modules/api/services';
import { OnDestroyNotifier$ } from '../../providers';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NbSelectModule],
  selector: 'app-token-select',
  templateUrl: './token-select.component.html',
  styleUrls: ['./token-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TokenSelectComponent),
      multi: true,
    },
    OnDestroyNotifier$,
  ],
})
export class TokenSelectComponent
  implements ControlValueAccessor, AfterViewInit
{
  @Input() placeholder = '';
  @Input() multiple = false;
  @Input() toValue?: (token: TokenDto) => unknown;
  @Input() fromValue?: (
    tokens: TokenDto[],
    value: unknown
  ) => TokenDto | undefined;

  selected?: TokenDto;

  readonly control = this.builder.control('');
  readonly init$ = new EventEmitter<void>();
  readonly tokens = this.tokenApiService.many({
    initialParams: {
      offset: 0,
      limit: 20,
      timestamp: Date.now(),
    },
    destroyNotifier: this.destroy$,
  });

  private onChange!: (value: unknown) => void;
  private onTouched!: () => void;

  constructor(
    private readonly builder: FormBuilder,
    private tokenApiService: TokenApiService,
    @Self() readonly destroy$: OnDestroyNotifier$
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }

  writeValue(obj: TokenDto): void {
    this.selected = this.fromValue
      ? this.fromValue(this.tokens.data.items, obj)
      : obj;
  }
  registerOnChange(fn: (value: unknown) => unknown): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => unknown): void {
    this.onTouched = fn;
  }

  onSelectedChange(token: TokenDto): void {
    this.selected = token;
    this.onChange(this.toValue ? this.toValue(token) : token);
  }

  onBlur(): void {
    this.onTouched();
  }
}
