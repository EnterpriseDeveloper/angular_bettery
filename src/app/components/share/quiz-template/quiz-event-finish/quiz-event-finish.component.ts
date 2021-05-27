import {Component, Input, OnInit} from '@angular/core';
import _ from 'lodash';

@Component({
  selector: 'quiz-event-finish',
  templateUrl: './quiz-event-finish.component.html',
  styleUrls: ['./quiz-event-finish.component.sass']
})
export class QuizEventFinishComponent implements OnInit {
  @Input() question;
  @Input() userData;
  @Input() myAnswers;
  @Input() joinRoom: boolean;


  constructor() {
  }

  ngOnInit(): void {
  }

  playersBet(i) {
    if (this.question.parcipiantAnswers == undefined) {
      return 0;
    } else {
      let data = _.filter(this.question.parcipiantAnswers, (x) => {
        return x.answer == i;
      });
      return data.length;
    }
  }

  expertsBet(i) {
    if (this.question.validatorsAnswers == undefined) {
      return 0;
    } else {
      let data = _.filter(this.question.validatorsAnswers, (x) => {
        return x.answer == i;
      });
      return data.length + '/' + this.question.validatorsAnswers.length;
    }
  }

  playersPers(i) {
    return ((this.playersBet(i) * 100) / this.playersCount()).toFixed(2) + '%';
  }

  playersCount() {
    return this.question.parcipiantAnswers == undefined ? 0 : this.question.parcipiantAnswers.length;
  }

  expertCount() {
    return this.question.validatorsAnswers == undefined ? 0 : this.question.validatorsAnswers.length;
  }

  pool(i) {
    if (this.question.parcipiantAnswers == undefined) {
      return 0;
    } else {
      let amount = 0;
      let data = _.filter(this.question.parcipiantAnswers, (x) => {
        return x.answer == i;
      });
      if (data.length == 0) {
        return 0;
      } else {
        data.forEach(e => {
          amount = amount + e.amount;
        });
        return  amount.toString().includes('.') ? amount.toFixed(1) : amount;
      }
    }
  }

  joined(data) {
    if (data !== undefined) {
      return data.length;
    } else {
      return 0;
    }
  }

  getPartPos(i, from) {
    let size = from == 'part' ? this.question.parcipiantAnswers.length : this.question.validatorsAnswers.length;
    let index = [4, 3, 2, 1];
    if (size === 1) {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': '5px'
      };
    } else {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': (i * 10) + 'px'
      };
    }
  }

  getPartPosText(length) {
    if (length === 2) {
      return {
        'position': 'relative',
        'right': '7px'
      };
    }
    if (length === 3) {
      return {
        'position': 'relative',
        'right': '13px'
      };
    }
    if ( length >= 4) {
      return {
        'position': 'relative',
        'right': '23px'
      };
    }
  }

  colorForRoom(color) {
    if (this.question) {
      return {
        'background': color
      };
    } else {
      return;
    }
  }

  getImg(i) {
    if (this.question.finalAnswer !== null) {
      if (this.myAnswers.answered) {
        if (this.question.finalAnswer == this.myAnswers.answer && this.question.finalAnswer == i) {
          return 'win';
        } else if (this.question.finalAnswer != this.myAnswers.answer) {
          if (this.question.finalAnswer == i) {
            return 'win';
          } else if (this.myAnswers.answer == i) {
            return 'wrong';
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        if (this.question.finalAnswer == i) {
          return 'win';
        } else {
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }

  getBackground(i) {
    if (this.getImg(i) == 'win') {
      return {
        'background': '#5DB145'
      };
    } else if (this.getImg(i) == 'wrong') {
      return {
        'background': '#C10000'
      };
    } else {
      return {
        'background': '#EAEAEA'
      };
    }
  }

}
