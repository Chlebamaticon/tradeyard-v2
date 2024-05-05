import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbButtonModule, NbInputModule } from '@nebular/theme';
import { subHours } from 'date-fns';
import { map, merge, Observable, of, scan, shareReplay } from 'rxjs';

type Message = {
  from: 'merchant' | 'customer' | 'moderator' | string;
  body: string;
  own: boolean;
  sent_at: Date;
  synced: boolean;
};

@Component({
  standalone: true,
  selector: 'app-complaint-thread',
  templateUrl: './complaint-thread.component.html',
  imports: [CommonModule, NbButtonModule, NbInputModule, ReactiveFormsModule],
  styleUrls: ['./complaint-thread.component.scss'],
})
export class ComplaintThreadComponent {
  group = this.builder.group({
    textbox: this.builder.control('', [Validators.required]),
  });

  author = input('unknown');
  author$ = toObservable(this.author);

  sendMessage$ = new EventEmitter<Message>();

  messages$: Observable<Message[]> = merge(
    of([
      {
        from: 'merchant' as const,
        body: 'Hello, how can I help you?',
        own: false,
        sent_at: subHours(Date.now(), 1),
        synced: true,
      },
    ]),
    this.sendMessage$.pipe(map((message) => [message]))
  ).pipe(
    scan(
      (acc: Message[], messages: Message[]) =>
        [...acc, ...messages].sort((a, b) => +a.sent_at - +b.sent_at),
      []
    ),
    shareReplay(1)
  );

  async send($event: Event): Promise<void> {
    $event.preventDefault();
    $event.stopPropagation();
    const {
      value: { textbox },
    } = this.group;

    if (!textbox) return;

    this.sendMessage$.emit({
      from: this.author(),
      body: textbox,
      sent_at: new Date(),
      own: true,
      synced: false,
    });

    this.group.reset();
  }

  constructor(readonly builder: FormBuilder) {}
}
