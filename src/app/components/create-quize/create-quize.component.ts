import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Question } from '../../models/Question.model';
import { faTimesCircle, faPlus, faCalendarAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { GetService } from '../../services/get.service';
import { PostService } from '../../services/post.service'
import { User } from '../../models/User.model';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as contract from '../../contract/contract';

type Time = { name: string, date: any, value: number };

const times: Time[] = [
  { name: "Now", date: new Date().setHours(new Date().getHours() + 0), value: null },
  { name: "1 hour", date: new Date().setHours(new Date().getHours() + 1), value: 1 },
  { name: "2 hours", date: new Date().setHours(new Date().getHours() + 2), value: 2 },
  { name: "4 hours", date: new Date().setHours(new Date().getHours() + 4), value: 4 },
  { name: "8 hours", date: new Date().setHours(new Date().getHours() + 8), value: 8 },
  { name: "12 hours", date: new Date().setHours(new Date().getHours() + 12), value: 12 },
  { name: "24 hours", date: new Date().setHours(new Date().getHours() + 24), value: 24 },
  { name: "2 days", date: new Date().setHours(new Date().getHours() + 48), value: 48 },
  { name: "5 days", date: new Date().setHours(new Date().getHours() + 120), value: 120 }
]

@Component({
  selector: 'create-quize',
  templateUrl: './create-quize.component.html',
  styleUrls: ['./create-quize.component.sass']
})
export class CreateQuizeComponent implements OnInit {

  submitted: boolean = false;
  questionForm: FormGroup;
  faTimesCircle = faTimesCircle;
  faPlus = faPlus;
  faTimes = faTimes;
  faCalendarAlt = faCalendarAlt;
  answesQuality: number = 2;
  users: User[] = [];
  allUsers: User[] = [];
  startTimeValue: string = "Now";
  exactStartTime = false;
  endTimeValue: string = "Chose end time";
  exactEndTime = false;
  times = times;
  inviteValidators: User[] = [];
  inviteParcipiant: User[] = [];
  host: User[] = [];
  generatedLink: number = undefined;
  startCaledarMeasure = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  listHashtags = [];
  myHashtags = [];


  constructor(
    private store: Store<AppState>,
    private router: Router,
    private formBuilder: FormBuilder,
    private getSevice: GetService,
    private PostService: PostService,

  ) {
    // check if user registerd
    // if no -> regirect to home page
    this.store.select("user").subscribe((x) => {
      if (x.length === 0) {
        this.router.navigate(['~ki339203/home'])
      } else {
        this.host = x;
        this.getAllUsers()
      }
    });
  }

  // get all users form server

  getAllUsers() {
    this.getSevice.get("user/all")
      .subscribe(
        (data: User[]) => {
          this.allUsers = data;
          this.users = data;
        },
        (err) => {
          console.log("get Users error: " + err)
        })
    this.getSevice.get('hashtags/get_all').subscribe(
      (data) => {
        this.listHashtags = data[0].hashtags;
      },
      (err) => {
        console.log("get Hashtags error: " + err)
      })
  }

  // formatter for Validator and Parcipiant search box
  formatter = (state: User) => state.nickName;

  // search in Validator and Parcipiant data Object
  search = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    map(term => this.users.filter(state => new RegExp(term, 'mi').test(state.nickName)).slice(0, 10))
  )

  searchHashtags = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    map(term => this.listHashtags.filter(state => new RegExp(term, 'mi').test(state)).slice(0, 10))
  )

  async ngOnInit() {
    // init validators
    this.questionForm = this.formBuilder.group({
      question: ['', Validators.required],
      answers: new FormArray([]),
      multyChoise: 'one',
      startDate: [new Date().setHours(new Date().getHours() + 0), Validators.required],
      calendarStartDate: [{ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }, Validators.required],
      startTime: [{ hour: 0, minute: 0, second: 0 }, Validators.required],
      endDate: ['', Validators.required],
      calendarEndDate: ['', Validators.required],
      endTime: [{ hour: 0, minute: 0, second: 0 }, Validators.required],
      privateOrPublic: "private",
      amountOfValidators: [0, [Validators.min(1), Validators.required]],
      amount: [0, [Validators.min(0.01), Validators.required]]
    });

    // init validations for answers

    for (let i = this.t.length; i < this.answesQuality; i++) {
      this.t.push(this.formBuilder.group({
        name: [i === 0 ? 'Yes' : "No", Validators.required],
      }));
    }

  }

  // validators for form
  get f() { return this.questionForm.controls; }
  get t() { return this.f.answers as FormArray; }

  // add one more answer to the form
  oneMoreAnswer() {
    this.t.push(this.formBuilder.group({
      name: ["", Validators.required],
    }));
    this.answesQuality = this.answesQuality + 1;
  }

  // delete one answer from the form
  deleteAnswer(index) {
    this.t.removeAt(index);
    this.answesQuality = this.answesQuality - 1;
  }

  switchTimeMethods(type) {
    this[type] = !this[type];
  }

  choseStartTime(value: Time) {
    this.startTimeValue = value.name;
    this.questionForm.controls.startDate.setValue(value.date)
  }

  choseEndTime(value: Time) {
    this.endTimeValue = value.name;
    this.questionForm.controls.endDate.setValue(value.value);
  }

  selectedHasgtags(value) {
    this.myHashtags.push(value.item);
    let input = <HTMLInputElement>document.getElementById("hashtags")
    setTimeout(() => {
      input.value = null;
    }, 100)
  }

  selectedValidators(item) {
    this.inviteValidators.push(item.item)
    this.users = this.users.filter((x)=> x.nickName !== item.item.nickName);
    let input = <HTMLInputElement>document.getElementById("invite_validators")
    setTimeout(() => {
      input.value = null;
    }, 100)
  }

  selectedParcipiant(item) {
    this.inviteParcipiant.push(item.item)
    this.users = this.users.filter((x)=> x.nickName !== item.item.nickName);
    let input = <HTMLInputElement>document.getElementById("invite_participants")
    setTimeout(() => {
      input.value = null;
    }, 100)
  }

  deleteValidatorOrParcipiant(nickName, path) {
    this[path] = this[path].filter(obj => obj.nickName !== nickName);
    let user = this.allUsers.find((x) => x.nickName === nickName)
    this.users.push(user);
  }

  deleteHash(hash) {
    this.myHashtags = this.myHashtags.filter(name => name !== hash);
  }

  addNewHash() {
    let input = <HTMLInputElement>document.getElementById("hashtags")
    this.myHashtags.push(input.value)
    setTimeout(() => {
      input.value = null;
    }, 100)
  }

  generateID() {
    return Math.floor((Math.random() * 1000000000000000) + 1)
  }


  getTimeStamp(strDate) {
    return new Date(strDate).getTime()
  }

  getStartTime() {
    if (this.exactStartTime === false) {
      return this.questionForm.value.startDate
    } else {
      let day = this.questionForm.value.calendarStartDate.day;
      let month = this.questionForm.value.calendarStartDate.month;
      let year = this.questionForm.value.calendarStartDate.year;
      let hour = this.questionForm.value.startTime.hour;
      let minute = this.questionForm.value.startTime.minute;
      let second = this.questionForm.value.startTime.second;
      return this.getTimeStamp(`${month}/${day}/${year} ${hour}:${minute}:${second}`)
    }
  }

  getEndTime() {
    if (this.exactEndTime === false) {
      return new Date(this.getStartTime()).setHours(new Date(this.getStartTime()).getHours() + this.questionForm.value.endDate)
    } else {
      let day = this.questionForm.value.calendarEndDate.day;
      let month = this.questionForm.value.calendarEndDate.month;
      let year = this.questionForm.value.calendarEndDate.year;
      let hour = this.questionForm.value.endTime.hour;
      let minute = this.questionForm.value.endTime.minute;
      let second = this.questionForm.value.endTime.second;
      return this.getTimeStamp(`${month}/${day}/${year} ${hour}:${minute}:${second}`)
    }
  }


  onSubmit() {
    this.submitted = true;
    console.log(this.myHashtags)

    if (this.exactEndTime === false) {
      this.questionForm.controls.calendarEndDate.setValue('test');
      this.questionForm.controls.endTime.setValue("test");
    } else {
      this.questionForm.controls.endDate.setValue("test");
    }


    if (this.questionForm.invalid) {
      return;
    }

    let id = this.generateID()

    this.sendToContract(id);

  }

  async sendToContract(id) {
    let hostWallet = this.host[0].wallet;
    let startTime = this.getStartTime();
    let endTime = this.getEndTime();
    let percentHost = parseInt("-1");
    let percentValidator = parseInt("-1");
    let questionQuantity = this.answesQuality

  //  let sendToContract = await contract.contract.methods.startQestion(hostWallet, id, startTime, endTime, percentHost, percentValidator, questionQuantity).send();
  //  console.log(sendToContract.transactionHash)
  //  if (sendToContract) {
        this.setToDb(id, "transactionHash");
  //  }
  }


  setToDb(id, transactionHash) {
    // think about status

    let data: Question = {
      id: id,
      status: "deployed",
      hostWallet: this.host[0].wallet,
      question: this.questionForm.value.question,
      hashtags: this.myHashtags,
      answers: this.questionForm.value.answers.map((x) => {
        return x.name
      }),
      multiChose: this.questionForm.value.multyChoise === "one" ? false : true,
      startTime: this.getStartTime(),
      endTime: this.getEndTime(),
      private: this.questionForm.value.privateOrPublic === "private" ? true : false,
      parcipiant: this.inviteParcipiant.map((x) => {
        return x.wallet
      }),
      validators: this.inviteValidators.map((x) => {
        return x.wallet
      }),
      validatorsAmount: this.questionForm.value.amountOfValidators,
      money: this.questionForm.value.amount * 1000000000000000000,
      validatorsAnaswers: [],
      parcipiantAnaswers: [],
      finalAnswers: null,
      transactionHash: transactionHash
    }

    this.PostService.post("question/set", data)
      .subscribe(
        () => {
          this.generatedLink = id;
          console.log("set to db DONE")
        },
        (err) => {
          console.log("set qestion error");
          console.log(err);
        })
  }

}