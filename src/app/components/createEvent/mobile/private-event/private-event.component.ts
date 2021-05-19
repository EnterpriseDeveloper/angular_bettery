import {Component, Output, EventEmitter, OnDestroy} from '@angular/core';
import {GetService} from '../../../../services/get.service';
import {PostService} from '../../../../services/post.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../app.state';
import {ClipboardService} from 'ngx-clipboard';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InfoModalComponent} from '../../../share/modals/info-modal/info-modal.component';
import {ErrorLimitModalComponent} from '../../../share/modals/error-limit-modal/error-limit-modal.component';
import {environment} from '../../../../../environments/environment';
import {User} from '../../../../models/User.model';
import {formDataAction} from '../../../../actions/newEvent.actions';

@Component({
  selector: 'private-event-modile',
  templateUrl: './private-event.component.html',
  styleUrls: ['./private-event.component.sass']
})
export class PrivateEventComponent implements OnDestroy {
  formData;
  @Output() goBack = new EventEmitter();
  spinner: boolean = false;
  host: User[];
  created = false;
  eventData: any;
  day: number | string;
  hour: number | string;
  minutes: number | string;
  seconds: number | string;
  userSub: Subscription;
  fromDataSubscribe: Subscription;
  createSub: Subscription;
  spinnerLoading: boolean = false;
  pastTime: boolean;
  copyLinkFlag: boolean;


  constructor(
    private getSevice: GetService,
    private postService: PostService,
    private store: Store<AppState>,
    private _clipboardService: ClipboardService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x?.length != 0) {
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

  copyToClickBoard() {
    this.copyLinkFlag = true;
    let href = window.location.hostname;
    let path = href == 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/private_event/${this.eventData._id}`);
    setTimeout(() => {
      this.copyLinkFlag = false;
    }, 500);
  }

  generateID() {
    let data = {
      id: this.host[0]._id,
      prodDev: environment.production
    };
    return this.postService.post('privateEvents/createId', data);
  }

  getStartTime() {
    return Number((Date.now() / 1000).toFixed(0));
  }

  getEndTime() {
    return Number(((Date.now() + this.formData.privateEndTime.date) / 1000).toFixed(0));
  }

  createEvent() {
    if (Number(this.getEndTime()) <= Number((Date.now() / 1000).toFixed(0))) {
      this.pastTime = true;
      return;
    } else {
      this.pastTime = false;
    }
    this.spinnerLoading = true;
    this.eventData = {
      host: this.host[0]._id,
      prodDev: environment.production,
      answers: this.formData.answers.map((x) => {
        return x.name;
      }),
      question: this.formData.question,
      startTime: this.getStartTime(),
      endTime: this.getEndTime(),
      winner: this.formData.winner,
      loser: this.formData.losers,
      roomName: this.formData.roomName,
      roomColor: this.formData.roomColor,
      whichRoom: this.formData.whichRoom,
      roomId: this.formData.roomId,
      resolutionDetalis: this.formData.resolutionDetalis,
      thumImage: this.formData.thumImage,
      thumColor: this.formData.thumColor,
    };

    this.createSub = this.postService.post('privateEvents/createEvent', this.eventData)
      .subscribe(
        (x: any) => {
          this.eventData._id = x.id;
          this.spinnerLoading = false;
          this.calculateDate();
          this.spinner = false;
          this.created = true;
          this.formDataReset();
        },
        (err) => {
          console.log('set qestion error');
          console.log(err);
          if (err.error == 'Limit is reached') {
            this.modalService.open(ErrorLimitModalComponent, {centered: true});
            this.spinnerLoading = false;
          }
        });
  }

  formDataReset() {
    this.formData.question = '';
    this.formData.answers = [];
    this.formData.losers = '';
    this.formData.winner = '';
    this.formData.room = '';
    this.formData.thumImage = '';
    this.formData.thumColor = '';
    this.formData.imgOrColor = 'color';

    this.store.dispatch(formDataAction({formData: this.formData}));
  }

  calculateDate() {
    let startDate = new Date();
    let endTime = new Date(this.eventData?.endTime * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    this.day = Math.floor(Math.abs(diffMs / 86400000));
    let hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    let minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    let second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.hour = Number(hour) > 9 ? hour : '0' + hour;
    this.minutes = Number(minutes) > 9 ? minutes : '0' + minutes;
    if (second === 60) {
      this.seconds = '00';
    } else {
      this.seconds = second > 9 ? second : '0' + second;

    }


    setTimeout(() => {
      this.calculateDate();
    }, 1000);
  }

  // TO DO
  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, {centered: true});
    modalRef.componentInstance.name = '- Actually, no need to! Bettery is smart and secure enough to take care of your event. You can join to bet as a Player or become an Expert to validate the result after Players. Enjoy!';
    modalRef.componentInstance.boldName = 'How to manage your event';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.createSub) {
      this.createSub.unsubscribe();
    }
    if (this.fromDataSubscribe) {
      this.fromDataSubscribe.unsubscribe();
    }
  }
}
