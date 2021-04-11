import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import _ from 'lodash';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbTimepickerConfig} from '@ng-bootstrap/ng-bootstrap';
import {NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {InfoModalComponent} from '../../../share/info-modal/info-modal.component';


type Time = { name: string, date: any, value: number };

const times: Time[] = [
  {name: '5 minutes', date: new Date().setMinutes(new Date().getMinutes() + 5) - Date.now(), value: 0.083},
  {name: '15 minutes', date: new Date().setMinutes(new Date().getMinutes() + 15) - Date.now(), value: 0.25},
  {name: '30 minutes', date: new Date().setMinutes(new Date().getMinutes() + 30) - Date.now(), value: 0.5},
  {name: '45 minutes', date: new Date().setMinutes(new Date().getMinutes() + 45) - Date.now(), value: 0.75},
  {name: '1 hour', date: new Date().setHours(new Date().getHours() + 1) - Date.now(), value: 1},
  {name: '2 hours', date: new Date().setHours(new Date().getHours() + 2) - Date.now(), value: 2},
  {name: '3 hours', date: new Date().setHours(new Date().getHours() + 3) - Date.now(), value: 3},
  {name: '4 hours', date: new Date().setHours(new Date().getHours() + 4) - Date.now(), value: 4},
  {name: '6 hours', date: new Date().setHours(new Date().getHours() + 6) - Date.now(), value: 6},
  {name: '8 hours', date: new Date().setHours(new Date().getHours() + 8) - Date.now(), value: 8},
  {name: '12 hours', date: new Date().setHours(new Date().getHours() + 12) - Date.now(), value: 12},
  {name: '18 hours', date: new Date().setHours(new Date().getHours() + 18) - Date.now(), value: 18},
  {name: '24 hours', date: new Date().setHours(new Date().getHours() + 24) - Date.now(), value: 24},
  {name: '36 hours', date: new Date().setHours(new Date().getHours() + 36) - Date.now(), value: 36},
  {name: '48 hours', date: new Date().setHours(new Date().getHours() + 48) - Date.now(), value: 48}
];

@Component({
  selector: 'make-rules-desktop',
  templateUrl: './make-rules-desktop.component.html',
  styleUrls: ['./make-rules-desktop.component.sass']
})
export class MakeRulesDesktopComponent implements OnInit {
  @Input() formData;
  @Output() goBack = new EventEmitter<Object[]>();
  @Output() goPublicEvent = new EventEmitter<Object[]>();
  @Output() goPrivateEvent = new EventEmitter<Object[]>();

  submitted = false;
  publicForm: FormGroup;
  privateForm: FormGroup;
  exactTime: FormGroup;
  times = times;
  endPrivateTime;
  endPublicTime;
  timeData: NgbTimeStruct = {hour: 0, minute: 0, second: 0};
  exactTimeBool: boolean;
  modalTrigger: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    config: NgbTimepickerConfig
  ) {
    config.seconds = false;
    config.spinners = false;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    if (this.formData.privateEndTime !== '') {
      let findTime = _.find(this.times, (x) => {
        return x.value === this.formData.privateEndTime.value;
      });
      let name = findTime.name.replace(/minutes|hours|hour/gi, '');
      this.endPrivateTime = name;
    }
    if (this.formData.exactTimeBool) {
      this.endPublicTime = `Until ${this.formData.exactDay} ${this.formData.exactMonth} ${this.formData.exactYear}, ${this.formData.exactHour} : ${this.formData.exactMinutes}`;
    } else if (this.formData.publicEndTime !== '') {
      let findTime = _.find(this.times, (x) => {
        return x.value === this.formData.publicEndTime.value;
      });
      this.endPublicTime = findTime.name;
    }
    this.publicForm = this.formBuilder.group({
      tokenType: [this.formData.tokenType],
      publicEndTime: [this.formData.publicEndTime, Validators.required],
      expertsCountType: [this.formData.expertsCountType],
      expertsCount: [this.formData.expertsCount, this.formData.expertsCountType == 'custom' ? Validators.required : '']
    });
    this.privateForm = this.formBuilder.group({
      winner: [this.formData.winner, Validators.required],
      losers: [this.formData.losers, Validators.required],
      privateEndTime: [this.formData.privateEndTime, Validators.required]
    });
    var monthtext = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    this.exactTime = this.formBuilder.group({
      day: [this.formData.exactDay],
      month: [typeof this.formData.exactMonth === 'string' ? this.formData.exactMonth : monthtext[this.formData.exactMonth]],
      year: [this.formData.exactYear]
    });

    this.timeData.hour = this.formData.exactHour;
    this.timeData.minute = this.formData.exactMinutes;
    this.exactTimeBool = this.formData.exactTimeBool;
  }

  get f() {return this.publicForm.controls;}

  get pub() {
    return this.publicForm.controls;
  }

  get priv() {
    return this.privateForm.controls;
  }

  openCalendar(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    this.populatedropdown('daydropdown', 'monthdropdown', 'yeardropdown');
  }

  openHowEventsWorkSocial(content) {
    this.modalService.open(content, {centered: true});
    this.modalTrigger = false;
  }

  openHowEventsWorkFriend(content) {
    this.modalService.open(content, {centered: true});
    this.modalTrigger = true;
  }

  openLearnMore() {
    const modalRef = this.modalService.open(InfoModalComponent, {centered: true});
    modalRef.componentInstance.name = '- Right now, Players can bet with BTY, the digital token of Bettery platform. Users need BTY to participate in events and (coming soon) grow their Reputation, which is required to access commercial events to earn money.';
    modalRef.componentInstance.name1 = 'Betting with ETH is coming later along our roadmap.';
    modalRef.componentInstance.boldName = 'What to bet with';
    modalRef.componentInstance.link = 'Learn more about how Bettery works';
  }

  chosePrivateEndTime() {
    let name = this.privateForm.controls.privateEndTime.value.replace(/minutes|hours|hour/gi, '');
    this.endPrivateTime = name;

    let findEl = _.find(this.times, (x) => {
      return x.name.replace(/minutes|hours|hour/gi, '') == name;
    });

    this.privateForm.controls.privateEndTime.setValue(findEl);
  }

  chosePublicEndTime() {
    this.endPublicTime = this.publicForm.controls.publicEndTime.value;
    let findEl = _.find(this.times, (x) => {
      return x.name == this.endPublicTime;
    });
    this.publicForm.controls.publicEndTime.setValue(findEl);
    this.exactTimeBool = false;
  }

  createPublicEvent() {
    this.submitted = true;
    if (this.publicForm.invalid) {
      return;
    }
    let data = {
      ...this.publicForm.value,
      ...this.exactTime.value,
      ...this.timeData,
      'exactTimeBool': this.exactTimeBool
    };
    this.goPublicEvent.next(data);
  }

  createPrivateEvent() {
    this.submitted = true;
    if (this.privateForm.invalid) {
      return;
    }
    this.goPrivateEvent.next(this.privateForm.value);
  }

  saveExactTime(modal) {
    this.endPublicTime = `Until ${this.exactTime.value.day} ${this.exactTime.value.month} ${this.exactTime.value.year}, ${this.timeData.hour} : ${this.timeData.minute}`;
    this.exactTimeBool = true;
    this.publicForm.controls.publicEndTime.setValue({hour: 0, minute: 0, second: 0});
    modal.dismiss('Cross click');
  }

  cancel() {
    let data = {
      ...this.publicForm.value,
      ...this.privateForm.value,
      ...this.exactTime.value,
      ...this.timeData,
      'exactTimeBool': this.exactTimeBool
    };
    this.goBack.next(data);
  }


  populatedropdown(dayfield, monthfield, yearfield) {

    var monthtext = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    var today: any = new Date();
    var dayfield: any = document.getElementById(dayfield);
    var monthfield: any = document.getElementById(monthfield);
    var yearfield: any = document.getElementById(yearfield);
    for (var i = 0; i < 31; i++) {
      dayfield.options[i] = new Option(String(i), String(i + 1));
      dayfield.options[today.getDate()] = new Option(today.getDate(), today.getDate(), true, true); //select today's day
    }
    for (var m = 0; m < 12; m++) {
      monthfield.options[m] = new Option(monthtext[m], monthtext[m]);
      monthfield.options[today.getMonth()] = new Option(monthtext[today.getMonth()], monthtext[today.getMonth()], true, true); //select today's month
    }
    var thisyear = today.getFullYear();
    for (var y = 0; y < 20; y++) {
      yearfield.options[y] = new Option(thisyear, thisyear);
      thisyear += 1;
    }
    yearfield.options[0] = new Option(today.getFullYear(), today.getFullYear(), true, true); //select today's year
  }

  reinitializeForm(param) {
    if (param === 'company') {
      this.formData.expertsCountType = 'company';
      this.initializeForm();
      this.publicForm.controls.publicEndTime.setValue(this.times[12]);
      this.endPublicTime = '';
    }
    if (param === 'custom') {
      this.formData.expertsCountType = 'custom';
      this.initializeForm();
      this.publicForm.controls.publicEndTime.setValue(this.times[0]);
      this.endPublicTime = '5 minutes';
    }
  }
}
