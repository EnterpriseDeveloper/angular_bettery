import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../../app.state';
import { User } from '../../../../../models/User.model';
import { PrivEventMobile } from '../../../../../models/PrivEventMobile.model';

@Component({
  selector: 'app-private-end-event',
  templateUrl: './private-end-event.component.html',
  styleUrls: ['./private-end-event.component.sass']
})
export class PrivateEndEventComponent implements OnInit, OnDestroy {
  @Input() eventData: PrivEventMobile;
  winners = [];
  losers = [];
  userSub: Subscription;
  award = 'none';
  participatedIndex: number;
  userData: User;


  constructor(
    private store: Store<AppState>
  ) {
  }

  ngOnInit(): void {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0];
        this.letsFindActivites(x[0]._id);
      }
    });
    this.letsFindWinner();
  }

  letsFindActivites(id) {
    let find = this.eventData.parcipiantAnswers.find((o) => {
      return o.userId == id;
    });
    if (find) {
      if (find.answer == this.eventData.finalAnswerNumber) {
        this.award = 'winner';
      } else {
        this.award = 'loser';
      }
      this.participatedIndex = find.answer;
    }
  }

  letsFindWinner() {
    if (this.eventData.parcipiantAnswers) {

      for (let i = 0; i < this.eventData.parcipiantAnswers.length; i++) {
        if (this.eventData.parcipiantAnswers[i].answer == this.eventData.finalAnswerNumber) {
          this.winners.push(this.eventData.parcipiantAnswers[i]);
        } else {
          this.losers.push(this.eventData.parcipiantAnswers[i]);
        }
      }
    }

  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
