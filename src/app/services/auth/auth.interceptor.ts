import { Injectable, OnDestroy } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { User } from '../../models/User.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor, OnDestroy {
  sessionToken: string;
  accessToken: string;
  userSub: Subscription;

  constructor(private store: Store<AppState>) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.sessionToken = x[0].sessionToken;
        this.accessToken = x[0].accessToken;
      }
    });

    request = request.clone({
      setHeaders: {
        Authorization: this.sessionToken ? `${this.sessionToken}` : '',
        Cookies: this.accessToken ? `${this.accessToken}` : '',
      }
    });

    return next.handle(request);
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
