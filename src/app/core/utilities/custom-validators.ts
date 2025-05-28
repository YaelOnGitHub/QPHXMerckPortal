/* eslint-disable prettier/prettier */
import { ValidationErrors, ValidatorFn, AbstractControl, Validators } from '@angular/forms';

export class CustomValidators {
    static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                return null;
            }
            const valid = regex.test(control.value);
            return valid ? null : error;

        };
    }

    static passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password: string = control?.get('password')?.value;
        const confirmPassword: string = control?.get('confirmPassword')?.value;
        if (confirmPassword && password !== confirmPassword) {
            control?.get('confirmPassword')?.setErrors({ NoPasswordMatch: true, message: 'Password mismatch' });
        }
        return null
    }

    static pinMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password: string = control?.get('NewPin')?.value;
        const confirmPassword: string = control?.get('ConfirmPin')?.value;
        if (confirmPassword && password !== confirmPassword) {
            control?.get('ConfirmPin')?.setErrors({ noPINMatch: true, message: 'PIN does not match' });

        }

        return null
    }

}