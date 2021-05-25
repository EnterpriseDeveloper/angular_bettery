import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InfoModalComponent } from '../../modals/info-modal/info-modal.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'quiz-choose-role',
  templateUrl: './quiz-choose-role.component.html',
  styleUrls: ['./quiz-choose-role.component.sass']
})
export class QuizChooseRoleComponent implements OnInit {
  @Input() question: any;
  @Output() player = new EventEmitter();
  @Output() expert = new EventEmitter();

  constructor(
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
  }

  getPartPos(i, from) {
    let size = from == "part" ? this.question.parcipiantAnswers.length : this.question.validatorsAnswers.length
    let index = [4, 3, 2, 1]
    if (size === 1) {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': "5px"
      }
    } else {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': (i * 10) + "px"
      }
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

  getValidatorStyle(data) {
    if (data) {
      return {
        'opacity': 0.5,
        'cursor': 'default',
        'padding-top': '6px',
        'padding-bottom': '6px',
        'line-height': '14px',
      }
    } else {
      return {
        'opacity': 1,
        'cursor': 'pointer',
      }
    }
  }

  joined(data) {
    if (data !== undefined) {
      return data.length
    } else {
      return 0
    }
  }

  timeValidating(question) {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return question.endTime - timeNow > 0
  }

  modalAboutPlayers() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = ' Bet on the event outcome. The prize pool is taken from loser bets and shared to winning Players, Host, Experts, and other roles.';
    modalRef.componentInstance.boldName = 'Player - ';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = ' Validate the event result, confirming what actually happened. For Social Media events, several Experts share a portion of the prize pool. For Friends events, the Expert has 24 hours to validate and gets a custom reward from the Host.';
    modalRef.componentInstance.boldName = 'Expert - ';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  joinAsPlayer() {
    this.player.next()
  }

  becomeValidator() {
    if (!this.timeValidating(this.question)) {
      this.expert.next()
    }
  }

  getPool(data) {
    let pool = 0;
    if (data.parcipiantAnswers !== undefined) {
      data.parcipiantAnswers.forEach(x => {
        pool = pool + Number(x.amount);
      });
      return pool.toString().includes('.') ? pool.toFixed(1) : pool;
    } else {
      return 0;
    }
  }

  // letsRegistration() {
  //   if (this.userData === undefined) {
  //     const modalRef = this.modalService.open(RegistrationComponent, {centered: true});
  //     modalRef.componentInstance.openSpinner = true;
  //   }
  // }

}
