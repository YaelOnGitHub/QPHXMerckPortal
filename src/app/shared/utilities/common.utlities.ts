/* eslint-disable prettier/prettier */

import { FormControl, ValidatorFn } from "@angular/forms";
import { indexOf } from "cypress/types/lodash";

// /* eslint-disable prettier/prettier */
export class CommonUtility {

   static confirmEmailValidator(confirmEmailInput: string): ValidatorFn {
      let confirmEmailControl: FormControl;
      let emailControl: FormControl;

      return (control: FormControl) => {
         if (!control.parent) {
            return null;
         }

         if (!confirmEmailControl) {
            confirmEmailControl = control;
            emailControl = control?.parent?.get(confirmEmailInput) as FormControl;
            emailControl?.valueChanges?.subscribe(() => {
               confirmEmailControl.updateValueAndValidity();
            });
         }

         if (emailControl?.value?.toLocaleLowerCase() !==
            confirmEmailControl?.value?.toLocaleLowerCase()
         ) {
            return { notMatch: true };
         }

         return null;
      };
   }

   static getArrayOfKeyFromNestedArrayOfObject(key, arrayOfObj) {
      let arrayOfKey = [];
      arrayOfObj.map((el) => {
         if (el[key]) {
            arrayOfKey.push(el[key]);
         }
      });
      return arrayOfKey.flat();
   }

}