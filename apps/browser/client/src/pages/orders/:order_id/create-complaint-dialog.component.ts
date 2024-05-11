import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbInputModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { firstValueFrom } from 'rxjs';

import { ComplaintApiService } from '../../../modules/api/services';

export interface CanComplain {
  complaint: () => Promise<void>;
}

@Component({
  standalone: true,
  selector: 'app-create-complaint-dialog',
  templateUrl: './create-complaint-dialog.component.html',
  styleUrls: ['./create-complaint-dialog.component.scss'],
  imports: [
    CommonModule,
    NbButtonModule,
    NbCardModule,
    NbInputModule,
    NbSpinnerModule,
    ReactiveFormsModule,
  ],
})
export class CreateComplaintDialogComponent {
  flow!: CanComplain;
  orderId!: string;
  pending = signal(false);
  pending$ = toObservable(this.pending);

  group = this.builder.group({
    body: this.builder.control('', [Validators.required]),
  });

  constructor(
    readonly builder: FormBuilder,
    readonly activatedRoute: ActivatedRoute,
    readonly complaintApiService: ComplaintApiService,
    readonly dialogRef: NbDialogRef<unknown>
  ) {}

  async close() {
    this.dialogRef.close();
  }

  async submit() {
    this.pending.set(true);
    try {
      await this.flow.complaint();
      const {
        value: { body },
      } = this.group;

      await firstValueFrom(
        this.complaintApiService.create({
          order_id: this.orderId,
          body: body ?? '',
        })
      );
      this.dialogRef.close();
    } catch (error) {
      console.error(error);
    } finally {
      this.pending.set(false);
    }
  }
}
