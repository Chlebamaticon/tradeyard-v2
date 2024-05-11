import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbInputModule } from '@nebular/theme';
import {
  combineLatest,
  combineLatestWith,
  exhaustMap,
  filter,
  from,
  map,
  skip,
  tap,
  withLatestFrom,
} from 'rxjs';

import { ComplaintDto, ComplaintMessageDto } from '@tradeyard-v2/api-dtos';

import { ComplaintApiService } from '../../../modules/api/services/complaint-api.service';

import { ActiveOrderComplaint } from './providers';

@Component({
  standalone: true,
  selector: 'app-complaint-thread',
  templateUrl: './complaint-thread.component.html',
  imports: [CommonModule, NbButtonModule, NbInputModule, ReactiveFormsModule],
  styleUrls: ['./complaint-thread.component.scss'],
})
export class ComplaintThreadComponent implements AfterViewInit {
  init$ = new EventEmitter<void>();

  group = this.builder.group({
    textbox: this.builder.control('', [Validators.required]),
  });

  refund = output<void>();
  release = output<void>();
  reject = output<void>();

  role = input<'user' | 'moderator'>('user' as const);
  role$ = toObservable(this.role);
  author = input('unknown');
  author$ = toObservable(this.author);

  container = viewChild.required<ElementRef<HTMLDivElement>>('container');

  submit$ = new EventEmitter<
    Pick<ComplaintMessageDto, 'body' | 'own' | 'sent_at'>
  >();

  messages = this.complaintApiService.manyMessages({
    initialParams: { offset: 0, limit: 20, timestamp: Date.now() },
    initNotifier: this.init$,
    paramsNotifier: from(this.complaint).pipe(
      map((complaint) => ({ complaintId: complaint?.complaint_id }))
    ),
  });
  data$ = combineLatest({
    messages: this.messages.data$.pipe(
      map(({ items }) =>
        items.sort((a, b) => +new Date(a.sent_at) - +new Date(b.sent_at))
      )
    ),
  });

  readonly scrollBottomOnInit = this.init$
    .pipe(
      combineLatestWith(this.data$),
      takeUntilDestroyed(),
      tap(() => this.scrollToBottom())
    )
    .subscribe();

  readonly scrollBottomOnceSentMessage = this.submit$
    .pipe(
      combineLatestWith(this.data$.pipe(skip(1))),
      takeUntilDestroyed(),
      tap(() => this.scrollToBottom())
    )
    .subscribe();

  readonly onSubmitSendMessage = this.submit$
    .pipe(
      withLatestFrom(from(this.complaint).pipe(filter(Boolean))),
      exhaustMap(([message, { complaint_id }]) =>
        this.complaintApiService.createMessage({
          complaint_id,
          body: message.body,
        })
      ),
      takeUntilDestroyed(),
      tap(() => this.messages.refresh())
    )
    .subscribe();

  constructor(
    @Inject(ActiveOrderComplaint)
    private complaint: Promise<ComplaintDto | null>,
    readonly builder: FormBuilder,
    private complaintApiService: ComplaintApiService
  ) {}

  ngAfterViewInit(): void {
    this.init$.emit();
    this.init$.complete();
  }

  scrollToBottom(): void {
    const { nativeElement } = this.container();
    if (nativeElement) {
      setTimeout(() => {
        nativeElement.scrollTop = nativeElement.scrollHeight;
      }, 0);
    }
  }

  async send($event: Event): Promise<void> {
    $event.preventDefault();
    $event.stopPropagation();
    const {
      value: { textbox },
    } = this.group;

    if (!textbox) return;

    this.submit$.emit({
      body: textbox,
      sent_at: new Date(),
      own: true,
    });

    this.group.reset();
  }
}
