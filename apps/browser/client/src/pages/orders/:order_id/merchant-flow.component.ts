import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NbCardModule, NbStepperModule } from '@nebular/theme';

@Component({
  standalone: true,
  selector: 'app-merchant-flow',
  templateUrl: './merchant-flow.component.html',
  styleUrls: ['./merchant-flow.component.scss'],
  imports: [CommonModule, NbCardModule, NbStepperModule],
})
export class MerchantFlowComponent {
  @Input() contractAddress!: string;
}
