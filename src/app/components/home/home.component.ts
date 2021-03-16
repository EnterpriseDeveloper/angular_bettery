import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {NgxTypedJsComponent} from 'ngx-typed-js';
import {Store} from '@ngrx/store';

import {formDataAction} from '../../actions/newEvent.actions';
import {environment} from '../../../environments/environment';
import * as EN from '../../../assets/locale/en.json';
import * as VN from '../../../assets/locale/vn.json';
import {PostService} from '../../services/post.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventsTemplatesDesktopComponent} from '../createEvent/desktop/events-templates-desktop/events-templates-desktop.component';
import {SessionStorageService} from '../rooms/sessionStorage-service/session-storage.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedLanguage: string;
  languages: { id: string, title: string }[] = [];
  translateSub: Subscription;
  active: boolean;
  newCreateEvent = '';
  typedCreateEvent = '';
  switchLang = 'en';
  topQuestions = EN.HEADER.TOP_QUESTIONS;
  scrollHideMenu: boolean;
  styleHideMenu = true;
  flagMenu = false;
  dropDownSwitch: boolean;
  eventSub: Subscription;
  eventData: any;
  triggerPopover: boolean;
  timerPopover: any;

  time: any;
  timer: any;
  timeInterval: any;
  form: FormGroup;
  submitted: boolean = false;
  subscribed: boolean = false;
  subscribedPost: Subscription;
  slideIndex = 0;
  isMobile: boolean;
  fromData;
  formDataSub: Subscription;

  @ViewChild(NgxTypedJsComponent, {static: true}) typed: NgxTypedJsComponent;

  constructor(
    private modalService: NgbModal,
    private translateService: TranslateService,
    private store: Store<any>,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private sessionStorage: SessionStorageService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.setClock(1617235200);
    this.mobileCheck();
  }

  ngOnInit() {
    this.translateService.use(environment.defaultLocale);
    this.selectedLanguage = environment.defaultLocale;
    this.translate();
    this.scrollMenuSetting();
    this.getEventFromServer();
  }

  changeLocale() {
    this.translateService.use(this.selectedLanguage);

    if (this.selectedLanguage === 'vn') {
      this.switchLang = 'vn';
      this.topQuestions = VN.HEADER.TOP_QUESTIONS;
    }
    if (this.selectedLanguage === 'en') {
      this.switchLang = 'en';
      this.topQuestions = EN.HEADER.TOP_QUESTIONS;
    }
  }

  translate(): void {
    this.translateSub = this.translateService.get(environment.locales.map(x => `LANGUAGES.${x.toUpperCase()}`))
      .subscribe(translations => {
        this.languages = environment.locales.map(x => {
          return {
            id: x,
            title: translations[`LANGUAGES.${x.toUpperCase()}`],
          };
        });
      });
  }

  open(content) {
    this.modalService.open(content, {centered: true, size: 'lg'});
  }

  @HostListener('click', ['$event'])
  a($event) {

    if (this.triggerPopover) {
      this.triggerPopover = false;
    }

    if (this.newCreateEvent.trim().length <= 0) {
      this.active = $event.target.className === 'typing' || $event.target.id === 'newEvent' || $event.target.className === 'pencil';
    }

    if ($event.target.className === 'typing') {
      this.typedCreateEvent = '';
    }
  }

  sendEvent() {
    //  to do remake
    this.formDataSub = this.store.select('createEvent').subscribe(x => {
      this.fromData = x?.formData;
    });
    if (this.fromData?.answers.length > 0) {
      this.fromData.answers = [];
    }
    this.fromData.question = this.newCreateEvent;
    if (this.fromData.question) {
      this.store.dispatch(formDataAction({formData: this.fromData}));
    } else {
      this.fromData.question = this.typedCreateEvent;
      this.store.dispatch(formDataAction({formData: this.fromData}));
    }
  }

  sendDefaultEvent($event) {
    setTimeout(() => {
      if ($event >= 0 && $event < this.topQuestions.length - 1) {
        this.typedCreateEvent = this.topQuestions[$event + 1];
      }
      if ($event === this.topQuestions.length - 1) {
        this.typedCreateEvent = this.topQuestions[0];
      }
    }, 2000);
  }

  renovationDefaultEvent() {
    this.typedCreateEvent = this.topQuestions[0];
  }

  scrollMenuSetting(): void {
    let prevScrollpos = window.pageYOffset;
    window.onscroll = () => {
      if (this.flagMenu) {
        return;
      }
      const currentScrollPos = window.pageYOffset;
      prevScrollpos > currentScrollPos ? this.scrollHideMenu = false : this.scrollHideMenu = true;
      prevScrollpos = currentScrollPos;
      if (currentScrollPos === 0 || currentScrollPos < 0) {
        this.styleHideMenu = true;
        this.scrollHideMenu = false;
      } else {
        this.styleHideMenu = false;
      }
    };
  }

  dropDown() {
    this.dropDownSwitch = !this.dropDownSwitch;
  }

  getEventFromServer() {
    const email = {
      email: 'voroshilovmax90@gmail.com'
    };
    this.eventSub = this.postService.post('bettery_event', email)
      .subscribe((x: any) => {
        console.log(x);
        this.shuffleArray(x);
        this.eventData = x.slice(0, 3);
      }, (err) => {
        console.log(err);
      });
  }

  shuffleArray(array): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  styleHideMen() {
    this.flagMenu = true;
    this.scrollHideMenu = true;
    setTimeout(() => {
      this.flagMenu = false;
    }, 1000);
  }

  showPopover() {
    this.triggerPopover = true;

    if (this.timerPopover) {
      clearTimeout(this.timerPopover);
    }

    this.timerPopover = setTimeout(() => {
      this.triggerPopover = false;
    }, 5000);
  }

  updateClock(endTime) {
    this.time = new Date();
    this.time = Date.parse(this.time) / 1000;

    const total = endTime - this.time;
    const days = Math.floor(total / (60 * 60 * 24));
    const hours = Math.floor(total / (60 * 60) % 24);
    this.timer = {
      total,
      days: this.getZero(days),
      hours: this.getZero(hours)
    };

    if (this.timer?.total <= 0) {
      clearInterval(this.timeInterval);
    }
  }

  setClock(endTime) {
    this.timeInterval = setInterval(() => this.updateClock(endTime), 60000);
    this.updateClock(endTime);
  }

  getZero = (num) => {
    return num >= 0 && num < 10 ? '0' + num : num.toString();
  };

  get f() {
    return this.form.controls;
  }

  subscribe() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    let data = {
      email: this.form.value.email,
      from: 'landing'
    };
    this.subscribedPost = this.postService.post('subscribe', data).subscribe((x) => {
      this.form.controls.email.setValue('');
      this.submitted = false;
      this.subscribed = true;
    }, (err) => {
      console.log(err);
    });
  }


  onSwiper($event: any) {
    this.slideIndex = $event.activeIndex;
  }

  ngOnDestroy() {
    if (this.translateSub) {
      this.translateSub.unsubscribe();
    }
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
    if (this.subscribedPost) {
      this.subscribedPost.unsubscribe();
    }
    if (this.formDataSub) {
      this.formDataSub.unsubscribe();
    }
  }

  sendEventDesktop() {
    this.sendEvent();
    this.modalService.open(EventsTemplatesDesktopComponent, {centered: true});
  }

  mobileCheck() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)) {

      this.isMobile = true;
    }
  }

  getSaveId(id) {
    this.sessionStorage.eventId = id;
  }
}

