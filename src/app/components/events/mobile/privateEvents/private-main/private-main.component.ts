import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostService } from '../../../../../services/post.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ClipboardService } from 'ngx-clipboard';
import { AppState } from '../../../../../app.state';
import _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfoModalComponent } from '../../../../share/info-modal/info-modal.component';
import { User } from '../../../../../models/User.model';
import { PrivEventMobile } from '../../../../../models/PrivEventMobile.model';
import { RegistrationComponent } from '../../../../registration/registration.component';

@Component({
  selector: 'app-private-main',
  templateUrl: './private-main.component.html',
  styleUrls: ['./private-main.component.sass']
})
export class PrivateMainComponent implements OnInit, OnDestroy {
  data: PrivEventMobile;

  answerForm: FormGroup;
  badRequest: boolean;
  condition: boolean;
  counts = 1;
  expert: boolean;
  expertPage: boolean;
  hideBtn = false;
  hideTitle = true;
  ifTimeValid: boolean;
  participatedIndex: number;
  finised: boolean = false;
  calculateDateTimer;
  themeChat = 'dark';

  routeSub: Subscription;
  userSub: Subscription;
  postSub: Subscription;
  userData: User;
  id: any;
  allTime: any = {
    day: '',
    hour: '',
    minutes: '',
    seconds: '',
  };

  constructor(
    private postService: PostService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private _clipboardService: ClipboardService,
    private modalService: NgbModal
  ) {
    this.userSub = this.store.select('user').subscribe((x: User[]) => {
      if (x.length != 0) {
        this.userData = x[0];
        this.letsFindActivites(x[0]._id);
      } else {
        clearTimeout(this.calculateDateTimer);
        this.userData = undefined;
        this.condition = undefined;
        this.counts = 1;
        this.expert = undefined;
        this.expertPage = undefined;
        this.hideBtn = false;
        this.hideTitle = true;
        this.ifTimeValid = undefined;
        this.participatedIndex = undefined;
      }
    });

    this.answerForm = formBuilder.group({
      answer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = {
        id: Number(params.id)
      };
      setTimeout(()=>{
        console.log(this.data)
      },5000)
    });

    this.letsGetDataFromDB();
  }

  letsGetDataFromDB() {
    this.postSub = this.postService.post('privateEvents/get_by_id', this.id).subscribe((value: PrivEventMobile) => {
      if (value.finalAnswer !== '') {
        this.finised = true;
      }
      this.data = value;
      if (this.userData) {
        this.letsFindActivites(this.userData._id);
      }
    }, (err) => {
      console.log(err);
      if (err.status === 404) {
        this.badRequest = true;
      }
    });
  }

  letsFindActivites(userID) {
    if (this.data && this.data.parcipiantAnswers) {
      let findParts = _.find(this.data.parcipiantAnswers, (o) => {
        return o.userId == userID;
      });
      if (findParts) {
        this.participatedIndex = findParts.answer;
        this.hideBtn = true;
      }
    }
    this.calculateDate();
  }

  async changePage() {
    const modalRef = this.modalService.open(RegistrationComponent, { centered: true });
    modalRef.componentInstance.openSpinner = true;
  }

  prevPage() {
    this.counts = 1;
  }

  nextPage() {
    this.counts = 2;
  }

  onExpertPage() {
    this.expertPage = true;
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    if (this.data.endTime - timeNow > 0) {
      this.ifTimeValid = false;
    } else {
      this.ifTimeValid = true;
    }
  }

  onChanged(increased: boolean) {
    this.letsGetDataFromDB();
    if (increased) {
      this.prevPage();
    } else {
      this.hideBtn = true;
      this.hideTitle = false;
      this.prevPage();
    }
  }

  returnWithStatus($event) {
    if ($event) {
      this.expertPage = false;
      this.expert = false;
    }
  }

  onChanged2($event: boolean) {
    if ($event) {
      this.expertPage = false;
    }
    this.letsGetDataFromDB();
  }

  calculateDate() {
    const timeNow = Number((Date.now() / 1000).toFixed(0));

    if (this.data?.endTime - timeNow > 0) {
      this.expert = true;
      this.condition = true;
    } else {
      this.expert = false;
      this.condition = true;
    }

    const startDate = new Date();
    const endTime = new Date(this.data?.endTime * 1000);
    var diffMs = (endTime.getTime() - startDate.getTime());
    this.allTime.day = Math.floor(Math.abs(diffMs / 86400000));
    const hour = Math.floor(Math.abs((diffMs % 86400000) / 3600000));
    const minutes = Math.floor(Math.abs(((diffMs % 86400000) % 3600000) / 60000));
    const second = Math.round(Math.abs((((diffMs % 86400000) % 3600000) % 60000) / 1000));

    this.allTime.hour = Number(hour) > 9 ? hour : '0' + hour;
    this.allTime.minutes = Number(minutes) > 9 ? minutes : '0' + minutes;
    if (second === 60) {
      this.allTime.seconds = '00';
    } else {
      this.allTime.seconds = second > 9 ? second : '0' + second;
    }
    this.calculateDateTimer = setTimeout(() => {
      this.calculateDate();
    }, 1000);
  }

  getPartPos(i) {
    let size = this.data.parcipiantAnswers ? this.data.parcipiantAnswers.length : 0;
    let index = [4, 3, 2, 1];
    if (size === 1) {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': '10px'
      };
    } else {
      return {
        'z-index': index[i],
        'position': 'relative',
        'right': (i * 10) + 'px'
      };
    }
  }

  modalAboutExpert() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = 'Validate the event result, confirming what actually happened. For Social Media events, several Experts share a portion of the prize pool. For Friends events, the Expert has 24 hours to validate and gets a custom reward from the Host.';
    modalRef.componentInstance.boldName = 'Expert - ';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  modalAboutPlayers() {
    const modalRef = this.modalService.open(InfoModalComponent, { centered: true });
    modalRef.componentInstance.name = 'Bet on the event outcome. The prize pool is taken from loser bets and shared to winning Players, Host, Experts, and other roles.';
    modalRef.componentInstance.boldName = 'Player - ';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  displayTime() {
    const timeNow = Number((Date.now() / 1000).toFixed(0));
    return this.data?.endTime - timeNow > 0;
  }

  copyToClickBoard() {
    const href = window.location.hostname;
    const path = href === 'localhost' ? 'http://localhost:4200' : href;
    this._clipboardService.copy(`${path}/private_event/${this.data.id}`);
  }

  openSoonModal(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.postSub) {
      this.postSub.unsubscribe();
    }
  }
}
