import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AocService } from '../aoc/aoc.service';
import { AuthService } from 'src/app/shared/services/auth-service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AocBlockerGuardFromUi implements CanActivate {
  private isAocFunctionalityEnabled: boolean = false;

  constructor(private _aocService: AocService, private _router: Router, private _authService: AuthService) {
    const configList = this._authService.getUserConfiguration();
    const aocFunctionality = configList?.find(el => el.settingKey === 'AOC_ENABLE_FUNCTIONALITY');
    
    this.isAocFunctionalityEnabled = aocFunctionality?.keyValue?.toLowerCase() === 'true';
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isManageAocRoute = state.url === '/manage-aoc';

    // If AOC functionality is disabled and trying to access /manage-aoc
    if (isManageAocRoute && !this.isAocFunctionalityEnabled) {
      this._router.navigate(['/brands']);
      return false; // Prevent access to /manage-aoc
    }

    return true; // Allow access if AOC functionality is not enabled
  }
}
