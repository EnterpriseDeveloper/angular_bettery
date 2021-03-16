import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { ClipboardService } from 'ngx-clipboard'
import { PostService } from '../../../../services/post.service'
import { Subscription } from 'rxjs';
import { InfoModalComponent } from '../../../share/info-modal/info-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorLimitModalComponent } from '../../../share/error-limit-modal/error-limit-modal.component';
import { User } from '../../../../models/User.model';
import { Router } from "@angular/router";


@Component({
  selector: 'public-event-desktop',
  templateUrl: './public-event-desktop.component.html',
  styleUrls: ['./public-event-desktop.component.sass']
})
export class PublicEventDesktopComponent implements OnDestroy {
  @Input() formData;
  @Output() goBack = new EventEmitter();
  created = false;
  day: number | string;
  hour: number | string;
  minutes: number | string;
  seconds: number | string;
  nickName: string;
  host: User[];
  quizData: any;
  userSub: Subscription;
  postSub: Subscription;
  spinnerLoading: boolean = false;

  constructor(
    private store: Store<AppState>,
    private _clipboardService: ClipboardService,
    private PostService: PostService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.userSub = this.store.select("user").subscribe((x: User[]) => {
      if (x.length !== 0) {
        this.nickName = x[0].nickName;
        this.host = x;
      }
    });
  }

  cancel() {
    this.goBack.next();
  }

  timeToBet() {
    if (this.formData.exactTimeBool) {
      return `${this.formData.exactDay} ${this.formData.exactMonth} ${this.formData.exactYear}, ${this.formData.exactHour} : ${this.formData.exactMinutes}`;
    } else {
      return this.formData.publicEndTime.name
    }
  }

  expertsName() {
    if (this.formData.expertsCountType === "company") {
      return "10% of Players"
    } else {
      return this.formData.expertsCount
    }
  }

  betWith() {
    if (this.formData.tokenType === "token") {
      return "BTY (Minimum bet is 1 BTY)"
    } else {
      return "ETH (Minimum bet is 0.001 ETH)"
    }
  }

  tokenCharacter() {
    if (this.formData.tokenType === "token") {
      return "BTY"
    } else {
      return "ETH"
    }
  }

  getStartTime() {
    return Number((new Date().getTime() / 1000).toFixed(0));
  }

  getTimeStamp(strDate) {
    return Number((new Date(strDate).getTime() / 1000).toFixed(0));
  }

  getEndTime() {
    if (!this.formData.exactTimeBool) {
      return Number(((Date.now() + this.formData.publicEndTime.date) / 1000).toFixed(0));
    } else {
      let day = this.formData.exactDay;
      let month = this.formData.exactMonth;
      let year = this.formData.exactYear;
      let hour = this.formData.exactHour;
      let minute = this.formData.exactMinutes;
      let second = 0;
      return this.getTimeStamp(`${month}/${day}/${year} ${hour}:${minute}:${second}`)
    }
  }

  createEvent() {
    this.spinnerLoading = true;

    this.quizData = {
      host: this.host[0]._id,
      question: this.formData.question,
      hashtags: [], // TODO
      amount: 0, // TODO amount of premium event
      answers: this.formData.answers.map((x) => {
        return x.name
      }),
      startTime: this.getStartTime(),
      endTime: Number(this.getEndTime()),
      validatorsAmount: this.formData.expertsCount,
      calculateExperts: this.formData.expertsCountType,
      currencyType: this.formData.tokenType,
      roomName: this.formData.roomName,
      roomColor: this.formData.roomColor,
      whichRoom: this.formData.whichRoom,
      roomId: this.formData.roomId
    }

    this.postSub = this.PostService.post("publicEvents/createEvent", this.quizData)
      .subscribe(
        (x: any) => {
          this.quizData._id = x.id;
          this.spinnerLoading = false;
          this.created = true;
          this.calculateDate()
          this.modalService.dismissAll();
          this.router.navigate([`room/${x.roomId}`]);
        },
        (err) => {
          this.spinnerLoading = false;
          if (err.error == "Limit is reached") {
            this.modalService.open(ErrorLimitModalComponent, { centered: true });
          }
          console.log("set qestion error");
          console.log(err);
        })
  }

  calculateDate() {
    let startDate = new Date();
    let endTime = new Date(this.quizData.endTime * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    this.day = Math.floor(Math.abs(diffMs / 86400000));
    let hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    let minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    let second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : "0" + hour;
    this.minutes = Number(minutes) > 9 ? minutes : "0" + minutes;
    if (second === 60) {
      this.seconds = "00"
    } else {
      this.seconds = second > 9 ? second : "0" + second;
    }
    setTimeout(() => {
      this.calculateDate()
    }, 1000);
  }

  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = '- Actually, no need to! Bettery is smart and secure enough to take care of your event. You can join to bet as a Player or become an Expert to validate the result after Players. Enjoy!';
    modalRef.componentInstance.boldName = 'How to manage your event';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }


}

