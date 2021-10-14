import {Component, Input} from '@angular/core';
import {Event} from '../../../../../models/Event.model';
import {User} from '../../../../../models/User.model';

@Component({
  selector: 'app-question-options-block',
  templateUrl: './question-options-block.component.html',
  styleUrls: ['./question-options-block.component.sass']
})
export class QuestionOptionsBlockComponent{
  @Input()question: Event;
  @Input('userData')userData: User;

  makeShortenStr(str: string, howMuch: number): string {
    return str.length > howMuch ? str.slice(0, howMuch) + '...' : str;
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

  avgBet(q) {
    let amount = 0;
    if (q.parcipiantAnswers == undefined) {
      return amount;
    } else {
      q.parcipiantAnswers.forEach(e => {
        amount = amount + e.amount;
      });
    }
    return this.checkFractionalNumb(amount, q.parcipiantAnswers.length, '/');
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
      return difference.toString().includes('.') ? difference.toFixed(1) : difference;
    }
    if (action === '/') {
      const avg = Number(num1) / Number(num2);
      return avg.toString().includes('.') ? avg.toFixed(1) : avg;
    }
  }

  eventFinishDate(data) {
    const d = new Date(Number(data.eventEnd) * 1000);
    return `${d.getDate()}/${Number(d.getMonth()) + 1}/${d.getFullYear()}`;
  }
}
