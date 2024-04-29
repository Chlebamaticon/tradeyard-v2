import { Pipe, PipeTransform } from '@angular/core';
import { formatUnits, parseUnits } from 'viem';

@Pipe({
  standalone: true,
  name: 'unit',
})
export class UnitPipe implements PipeTransform {
  transform(value: bigint | string, precision: number): string {
    return `${
      precision >= 0
        ? parseUnits(`${value}`, precision)
        : formatUnits(BigInt(value), precision * -1)
    }`;
  }
}
