import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AocService } from '../aoc/aoc.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { StorageType } from 'src/app/shared/enums/storage-type';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AocBlockerGuard implements CanActivate {
  private isAocFunctionalityEnabled: boolean = false;

  constructor(
    private _aocService: AocService,
    private _router: Router,
    private _authService: AuthService,
    private _session: SessionService,
    private toastService: ToastrService
  ) {
    // Check if AOC functionality is enabled based on the user configuration
    const configList = this._authService.getUserConfiguration();
    const aocFunctionality = configList?.find(el => el.settingKey === 'AOC_ENABLE_FUNCTIONALITY');
    
    this.isAocFunctionalityEnabled = aocFunctionality?.keyValue?.toLowerCase() === 'true';
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // If AOC functionality is not enabled, allow access to the route
    if (!this.isAocFunctionalityEnabled) {
      return true;
    }

    // If AOC functionality is enabled, fetch AOC status
    return this._aocService.getAocStatus().pipe(
      switchMap(res => {
        const { isAocBlocker, totalOpenAOCs, canUserContinue } = res.data;

        // If the user has a blocker or cannot continue, redirect to manage-aoc
        if (isAocBlocker || (totalOpenAOCs > 0 && !canUserContinue)) {
          if(this.isFirstLogin())
          {
            this.toastService.error('There are additional shipments that require acknowledgement.');
          }
   

          this._router.navigate(['/manage-aoc']);
          return of(false);  // Block navigation by returning Observable<boolean>
        }

       

        // No issues, allow access
        return of(true);  // Allow navigation by returning Observable<boolean>
      }),
      catchError(error => {
        console.error('Error fetching AOC status:', error);
        // If there's an error, deny access
        return of(false);
      })
    );
  }

  isFirstLogin(): boolean {
    const firstLoginFlag = localStorage.getItem('firstBrandsLogin');
    // Explicitly check if the flag is null or undefined
    return firstLoginFlag === 'true';
  }
 


}
