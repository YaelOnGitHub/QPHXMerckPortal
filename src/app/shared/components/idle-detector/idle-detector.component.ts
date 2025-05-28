import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Router } from '@angular/router';
import { Keepalive } from '@ng-idle/keepalive';
import { Subscription, timer } from 'rxjs';
import { AlertService } from '../alert/alert.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { cartManagementService } from '../../services/cart-management-service/cart-management-service';
import { LoginService } from 'src/app/features/login/login.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service'

@Component({
  selector: 'app-idle-detector',
  templateUrl: './idle-detector.component.html',
  styleUrls: ['./idle-detector.component.scss']
})
export class IdleDetectorComponent implements OnInit {

  idleState = 'NOT_STARTED';
  countdown: Subscription;
  lastPing?: Date = null;
  showPopUp: boolean = false;
  subscriptions: Subscription[] = [];
  idleNotification: Notification;
  counter = parseInt(this._entitlementService.hasEntitlementMatchForOrderPlace('INACTIVITY_COUNT_DOWN_TIMER')) || 60;
  idleTime = parseInt(this._entitlementService.hasEntitlementMatchForOrderPlace('INACTIVITY_IDLE_TIME')) || 70;

  @Input() clientTitle: string;
  @Input() clientIcon: string;

  constructor(private idle: Idle,
    private keepalive: Keepalive,
    private ngZone: NgZone,
    private _alertService: AlertService,
    private _authService: AuthService,
    private _loginService: LoginService,
    private _cartManagementService: cartManagementService,
    private _entitlementService: EntitlementService,
    private router: Router,
    private cd: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.initiateIdleTimer();
  }

  initiateIdleTimer(): void {
    this.initIdleEvents();
    this.idle.watch();
    this.idleState = 'NOT_IDLE';
    this.countdown = null;
    this.lastPing = null;
  }

  initIdleEvents(): void {
    this.clearSubscriptions();

    /**
     * after set idle time user will be considered idle and timeout time will start
     */
    this.idle.setIdle(3);
    this.idle.setTimeout(this.idleTime);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.subscriptions.push(
      this.idle.onIdleStart.subscribe(() => {
        this.idleState = 'IDLE';
      })
    );

    this.subscriptions.push(
      this.idle.onIdleEnd.subscribe(() => {
        this.idleState = 'NOT_IDLE';
        this.showPopUp = false;
        if (this.countdown)
          this.countdown.unsubscribe()
        this.countdown = null;
        this.cd.detectChanges();
        if (this.idleNotification && this.counter !== parseInt(this._entitlementService.hasEntitlementMatchForOrderPlace('INACTIVITY_COUNT_DOWN_TIMER'))) {
          this.refreshToken()
          this.idleNotification.close();
        }
        this.counter = parseInt(this._entitlementService.hasEntitlementMatchForOrderPlace('INACTIVITY_COUNT_DOWN_TIMER'))
      })
    );

    this.subscriptions.push(
      this.idle.onTimeout.subscribe(() => {
        this.idleState = 'TIMED_OUT';
        this._alertService.closeAllModals()
        this.refreshPage()
        this.ngZone.run(() => {
          this.idleTimeOut();
        });
      })
    );

    this.subscriptions.push(
      this.idle.onTimeoutWarning.subscribe((seconds: any) => {
        // this.countdown = seconds;
        if (seconds === this.counter) {
          if (this.countdown !== null) return
          this.countdown = timer(0, 1000)
            .subscribe(() => --this.counter)
          this.showPopUp = true;
          this.idleNotification = new Notification(this.clientTitle, {
            body: `Your session is going to expire in ${this.counter} seconds`,
            icon: this.clientIcon,
          });
          this.idleNotification.onclick = (event) => {
            event.preventDefault();
            this.reset();
          };
        }
      })
    );

    this.keepalive.interval(15);
    this.subscriptions.push(
      this.keepalive.onPing.subscribe(() => (this.lastPing = new Date()))
    );
  }

  refreshPage() {
    this.router.navigateByUrl('login', { skipLocationChange: true }).then(() => {
      window.location.reload();
    });
  }

  clearSubscriptions(): void {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe()
    });
    if (this.countdown)
      this.countdown.unsubscribe()
  }

  /**
   * To destroy the all callbacks
   */
  ngOnDestroy(): void {
    this.clearSubscriptions();

  }

  /**"
   * Remove pop-up and logout due to inactivity
   */
  idleTimeOut(): void {
    if (this.idleNotification) {
      this.idleNotification.close();
    }
    this.showPopUp = false;
    this.idle.stop();
    this.clearSubscriptions();
    this.endSession();
  }

  endSession() {
    this._authService.endSession();
    this._cartManagementService.clearProductStore()
    this._loginService.setLogin.next(false)
  }

  /**
   * we'll call this method when we want to start/reset the idle process
   * reset any component state and be sure to call idle.watch()
   */
  reset() {
    this.idle.watch();
    this.idleState = 'NOT_IDLE';
    if (this.countdown)
      this.countdown.unsubscribe()
    this.showPopUp = false;
    this.counter = parseInt(this._entitlementService.hasEntitlementMatchForOrderPlace('INACTIVITY_COUNT_DOWN_TIMER'))
  }

  /**
   * Get the new Token by refresh token
   */
  refreshToken() {
    const userSession = this._authService.getUserSession();
    if (userSession.refreshToken) {
      this._authService.refreshToken({
        refreshToken: userSession.refreshToken,
        LoginType: this._authService.getSocialMediaLoginInfo() || 'manual'
      }).subscribe((authResponse: any) => {
        let authResponseData = authResponse.data;
        if (authResponse.success) {
          this._authService.saveUserSession(authResponseData);
        }
      });
    }
  }
}
