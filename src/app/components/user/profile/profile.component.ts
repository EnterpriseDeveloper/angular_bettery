import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { User } from '../../../models/User.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationComponent } from '../../registration/registration.component';

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
  ) { 
    this.storeUserSubscribe = this.store.select('user').subscribe((x: User[]) => {
      console.log(x);
      if (x.length === 0) {
        const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
        modalRef.componentInstance.openSpinner = true;
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
