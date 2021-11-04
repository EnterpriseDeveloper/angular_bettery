import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { PubEventMobile } from '../../../../../models/PubEventMobile.model';
import { User } from '../../../../../models/User.model';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reverted-public',
  templateUrl: './reverted-public.component.html',
  styleUrls: ['./reverted-public.component.sass']
})
export class RevertedPublicComponent implements OnDestroy {
  storeSub: Subscription;
  @Input() eventData: PubEventMobile;
  userData: User;

  constructor(private store: Store<any>) {
    this.getUsers();
  }

  getUsers() {
    this.storeSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0];
      } else {
        this.userData = undefined;
      }
    });
  }


  statusReverted(data) {
    let x = data.status.replace("reverted:", " ")
    if (x.search("not enough experts") != -1) {
      return x + " (" + (data.validatorsAnswers ? data.validatorsAnswers.length : 0) + "/" + data.validatorsAmount + ")"
    } else {
      return x;
    }
  }

  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

}
