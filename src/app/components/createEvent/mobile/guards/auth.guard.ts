import {Injectable, OnDestroy} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Store} from "@ngrx/store";
import {AppState} from "../../../../app.state";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, OnDestroy {
  can: boolean;
  formData;
  userSub: Subscription;
  formDataSub: Subscription;

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.userSub = this.store.select('user').subscribe(x => {
      if (x && x?.length != 0) {
        this.can = true;
      } else {
        this.can = false;
      }
    });

    this.formDataSub = this.store.select('createEvent').subscribe(x => {
      this.formData = x.formData;
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.can && this.formData?.question?.length !== 0) {
      return true;
    } else {
      return this.router.navigateByUrl('/create-event');
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.formDataSub) {
      this.formDataSub.unsubscribe();
    }
  }
}
