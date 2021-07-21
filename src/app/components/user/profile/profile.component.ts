import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { User } from '../../../models/User.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../registration/registration.component';
import { Router } from '@angular/router';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {
  storeUserSubscribe: Subscription;
  userData: User = undefined;


  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.storeUserSubscribe = this.store.select('user').subscribe((x: User[]) => {
      if (x.length === 0) {
        let autoLogin = localStorage.getItem('_buserlog');
        if (autoLogin == null) {
          const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
          modalRef.componentInstance.openSpinner = true;
          modalRef.componentInstance.closedWindow.subscribe((e) => {
            this.router.navigate(['join']);
          });
        }
      } else {
        this.userData = x[0];

      }
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    if (this.storeUserSubscribe) {
      this.storeUserSubscribe.unsubscribe();
    }
  }

}
