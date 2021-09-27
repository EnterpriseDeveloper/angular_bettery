import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { ClipboardService } from 'ngx-clipboard'
import { PostService } from '../../../../services/post.service'
import {GetService} from "../../../../services/get.service"
import { Subscription } from 'rxjs';
import { InfoModalComponent } from '../../../share/both/modals/info-modal/info-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorLimitModalComponent } from '../../../share/both/modals/error-limit-modal/error-limit-modal.component';
import { User } from '../../../../models/User.model';
import { Router } from "@angular/router";
import { formDataAction } from "../../../../actions/newEvent.actions";
import { connectToSign } from '../../../../contract/cosmosInit';


@Component({
  selector: 'public-event-mobile',
  templateUrl: './public-event.component.html',
  styleUrls: ['./public-event.component.sass']
})
export class PublicEventComponent implements OnDestroy {
  formData;
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
  deleteEventSub: Subscription;
  createIDSub: Subscription;
  fromDataSubscribe: Subscription;
  spinnerLoading: boolean = false;
  pastTime: boolean;
  copyLinkFlag: boolean;

  constructor(
    private store: Store<AppState>,
    private _clipboardService: ClipboardService,
    private PostService: PostService,
    private GetService: GetService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.userSub = this.store.select("user").subscribe((x: User[]) => {
      if (x && x.length !== 0) {
        this.nickName = x[0].nickName;
        this.host = x;
      }
    });
    this.fromDataSubscribe = this.store.select('createEvent').subscribe(x => {
      this.formData = x?.formData;
    });
  }

  cancel() {
    this.router.navigate(['/make-rules']);
  }

  timeToBet() {
    if (this.formData.exactTimeBool) {
      return `${this.formData.exactDay} ${this.formData.exactMonth} ${this.formData.exactYear.toString().substr(2)}, ${this.formData.exactHour < 10 ? '0' + this.formData.exactHour : this.formData.exactHour} : ${this.formData.exactMinutes < 10 ? '0' + this.formData.exactMinutes : this.formData.exactMinutes }`;
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
      return "BET (Minimum bet is 0.01 BET)"
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

  copyToClickBoard() {
    this.copyLinkFlag = true;
    let href = window.location.hostname
    let path = href == "localhost" ? 'http://localhost:4200' : href
    this._clipboardService.copy(`${path}/public_event/${this.quizData._id}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
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
    if (Number(this.getEndTime()) <= Number((Date.now() / 1000).toFixed(0))) {
      this.pastTime = true;
      return;
    } else {
      this.pastTime = false;
    }
    this.spinnerLoading = true;
    this.createIDSub = this.GetService.get("publicEvents/create_event_id")
    .subscribe((x: any) => {
     this.sendToDemon(x.id)
    }, (err) => {
      console.log("create event id err: ", err)
    })
  }

  getAnswers(){
    let answer = this.formData.answers.map((x) => {
      return x.name
    })
    return answer.sort();
  }

  async sendToDemon(id: number) {
    let { memonic, address, client } = await connectToSign()

    const msg = {
      typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreateCreatePubEvents",
      value: {
        creator: address,
        pubId: id,
        question: this.formData.question,
        answers: this.getAnswers(),
        premAmount: "0", // TODO add for premium amount
        startTime: this.getStartTime(),
        endTime: Number(this.getEndTime()),
        expertAmount: this.formData.expertsCountType == "company" ? 0 : this.formData.expertsCount,
        advisor: ""
      }
    };
    const fee = {
      amount: [],
      gas: "1000000",
    };
    try {
      let transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
      if(transact.transactionHash && transact.code == 0){
        this.sendToDb(transact.transactionHash, id)
      }else{
        // TODO check validation
        this.deleteEventId(id)
        console.log("transaction unsuccessful", transact)
      }
    } catch (err) {
      this.deleteEventId(id)
      console.log(err)
    }
  }


  sendToDb(transactionHash: any, id: number) {  

    this.quizData = {
      _id: id,
      host: this.host[0]._id,
      question: this.formData.question,
      hashtags: [], // TODO
      premiumTokens: 0, // TODO amount on premium event
      premium: false, // TODO premium true or false
      answers: this.getAnswers(),
      startTime: this.getStartTime(),
      endTime: Number(this.getEndTime()),
      validatorsAmount: this.formData.expertsCountType == "company" ? 0 : this.formData.expertsCount,
      calculateExperts: this.formData.expertsCountType,
      currencyType: this.formData.tokenType,
      roomName: this.formData.roomName,
      roomColor: this.formData.roomColor,
      whichRoom: this.formData.whichRoom,
      roomId: this.formData.roomId,
      resolutionDetalis: this.formData.resolutionDetalis,
      thumImage: this.formData.thumImage,
      thumColor: this.formData.thumColor,
      transactionHash: "0x"+transactionHash
    }

    this.postSub = this.PostService.post("publicEvents/createEvent", this.quizData)
      .subscribe(
        (x: any) => {
          this.spinnerLoading = false;
          this.created = true;
          this.calculateDate();
          this.formDataReset();
          console.log("set to db DONE")
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

  deleteEventId(id) {
    this.deleteEventSub = this.PostService.post("publicEvents/delete_event_id", {id: id})
    .subscribe((x)=>{
      console.log(x);
    },(err)=>{
      console.log("err from delete event id", err)
    })
  }

  formDataReset() {
    this.formData.question = '';
    this.formData.answers = [];
    this.formData.losers = '';
    this.formData.winner = '';
    this.formData.roomName = '';
    this.formData.thumImage = '';
    this.formData.thumColor = '';
    this.formData.imgOrColor = 'color';

    this.store.dispatch(formDataAction({ formData: this.formData }));
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
    };
    if (this.postSub) {
      this.postSub.unsubscribe();
    };
    if (this.fromDataSubscribe) {
      this.fromDataSubscribe.unsubscribe();
    };
    if(this.deleteEventSub){
      this.deleteEventSub.unsubscribe();
    }
    if(this.createIDSub){
      this.createIDSub.unsubscribe();
    }
  }


}
