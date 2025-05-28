import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { map, Observable } from 'rxjs';
import { UnsavedChangesModalComponent } from '../components/unsaved-changes-modal/unsaved-changes-modal.component';

export interface CanComponentDeactivate {
    canDeactivate(): boolean;
}

@Injectable()
export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
    constructor(private _modalService: BsModalService) {

    }

    isValid: boolean;
    canDeactivate(
        component: CanComponentDeactivate,
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {

        if (component.canDeactivate ? !component.canDeactivate() : true) return true;
        else {
            let initialState = {
                label: 'You have unsaved changes!',
                btnCancelTxt: 'Cancel',
                btnSuccessTxt: 'Ok'
            }
            const dialogRef = this._modalService.show(UnsavedChangesModalComponent, { initialState, ignoreBackdropClick: true, class: 'modal-md' });
            return dialogRef.onHidden.pipe(map(_ => dialogRef?.content?.isConfirm))
        }
    }
}