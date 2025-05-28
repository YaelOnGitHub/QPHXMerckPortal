/* eslint-disable prettier/prettier */
/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Directive, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appPatternRestriction]',
    host: {
        '(keydown)': 'onKeyPress($event)',
    }
})

export class PatternDirective {
    constructor(public model: NgControl, private el: ElementRef) { }
    @Input() allowedPattern: string;

    onKeyPress(event) {

        let ctrlKey = event.ctrlKey ? event.ctrlKey : ((event.keyCode === 17)
            ? true : false);

        if (event.key === "Backspace") {
            return true;
        }
        if (ctrlKey && event.key === "v") {
            return true;
        }

        let allowed = new RegExp(this.allowedPattern).test(event.key);
        if (allowed) {
            return true;
        }
        else {
            return false;
        }
    }
}