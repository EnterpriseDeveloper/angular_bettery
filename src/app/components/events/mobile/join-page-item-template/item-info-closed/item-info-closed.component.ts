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

  getLost(data) {
    if (this.userData != undefined && data) {
      const findParc = data.parcipiantAnswers.filter((x) => {
        return x.userId == this.userData._id;
      });
      return this.checkFractionalNumb(findParc[0].amount, findParc[0].mintedToken, '-');
    }
  }

  checkFractionalNumb(num1, num2, action) {
    if (action === '+') {
      const sum = Number(num1) + Number(num2);
      let value: string =  sum.toString().includes('.') ? sum.toFixed(2) : sum.toString();

      if ( value.includes('0.00')){
        value = '<' + ' 0.01';
        return value;
      }else {
        return value;
      }
    }

    if (action === '-') {
      const difference = Number(num1) - Number(num2);
      return difference.toString().includes('.') ? difference.toFixed(2) : difference;
    }
    if (action === '/') {
      const avg = Number(num1) / Number(num2);
      return avg.toString().includes('.') ? avg.toFixed(2) : avg;
    }
  }

}
