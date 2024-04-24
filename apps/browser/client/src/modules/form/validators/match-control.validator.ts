import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function matchValidator(
  matchTo: string,
  reverse?: boolean
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.parent && reverse) {
      const hostControl = (control.parent?.controls as any)[
        matchTo
      ] as AbstractControl;
      if (hostControl) {
        hostControl.updateValueAndValidity();
      }
      return null;
    }
    return !!control.parent &&
      !!control.parent.value &&
      control.value === (control.parent?.controls as any)[matchTo].value
      ? null
      : { matching: true };
  };
}
