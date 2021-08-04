import {Component, Input, OnInit} from '@angular/core';
import {Event} from '../../../../../models/Event.model';
import {User} from '../../../../../models/User.model';

@Component({
  selector: 'app-item-info-closed',
  templateUrl: './item-info-closed.component.html',
  styleUrls: ['./item-info-closed.component.sass']
})
export class ItemInfoClosedComponent implements OnInit {
@Input()question: Event;
@Input()userData: User;

  constructor() { }

  ngOnInit(): void {
  }

  timeValidating(question) {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return question.endTime - timeNow > 0;
  }

  getValidatorsAmount(q) {
    return q.validatorsAnswers === undefined ? 0 : q.validatorsAnswers.length;
  }

  getValidatorsAmountLeft(eventData) {
    return eventData.validatorsAmount == 0 ? this.expertAmount(eventData) : eventData.validatorsAmount;
  }

  expertAmount(eventData) {
    const part = eventData.parcipiantAnswers == undefined ? 0 : eventData.parcipiantAnswers.length;
    if (part < 11) {
      return 3;
    } else {
      return Math.round(part / (Math.pow(part, 0.5) + 2 - (Math.pow(2, 0.5))));
    }
  }

  eventFinishDate(data) {
    const d = new Date(Number(data.eventEnd) * 1000);
    return `${d.getDate()}/${Number(d.getMonth()) + 1}/${d.getFullYear()}`;
  }


}
