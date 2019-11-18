import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Question } from '../../models/Question.model';
import { faTimesCircle, faPlus, faCalendarAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { GetService } from '../../services/get.service';
import { User } from '../../models/User.model';
import { debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators';
import {Observable} from 'rxjs';

type Time = {name: string};


const times: Time[] = [
  {name: "1 hour"},
  {name: "12 hour"},
  {name: "1 day"},
  {name: "2 days"},
  {name: "3 days"},
  {name: "5 days"}
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
  startTimeValue: string = "Chose start time";
  exactStartTime = false;
  endTimeValue: string = "Chose end time";
  exactEndTime = false;
  times = times;
  inviteValidators: User[] = [];
  inviteParcipiant: User[] = [];


  constructor(
    private store: Store<AppState>,
    private router: Router,
    private formBuilder: FormBuilder,
    private getSevice: GetService
  ) {
    this.store.select("user").subscribe((x) => {
      if (x.length === 0) {
        this.router.navigate(['/home'])
      } else {
        this.getAllUsers()
      }
    });
  }

  getAllUsers() {
    this.getSevice.get("user/all")
      .subscribe(
        (data: User[]) => {
          this.users = data;
        },
        (err) => {
          console.log("get Users error: " + err)
        })
  }

  formatter = (state: User) => state.nickName;

  search = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    map(term => this.users.filter(state => new RegExp(term, 'mi').test(state.nickName)).slice(0, 10))
  )

  ngOnInit() {
    this.questionForm = this.formBuilder.group({
      question: ['', Validators.required],
      hashtags: [''],
      answers: new FormArray([]),
      multyChoise: 'one',
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      privateOrPublic: "private",
      amount: [0, [Validators.min(0.01), Validators.required]]
    });
    for (let i = this.t.length; i < this.answesQuality; i++) {
      this.t.push(this.formBuilder.group({
        name: [i === 0 ? 'yes' : "no", Validators.required],
      }));
    }
  }

  get f() { return this.questionForm.controls; }
  get t() { return this.f.answers as FormArray; }

  oneMoreAnswer() {
    this.t.push(this.formBuilder.group({
      name: ["", Validators.required],
    }));
    this.answesQuality = this.answesQuality + 1;
  }

  deleteAnswer(index) {
    this.t.removeAt(index);
    this.answesQuality = this.answesQuality - 1;
  }

  switchTimeMethods(type){
     this[type] = !this[type];
  }

  choseTime(value, from){
     this[from] = value;
  }

  selectedValidators(item){
    this.inviteValidators.push(item.item)
    let input = <HTMLInputElement>document.getElementById("invite_validators")
    setTimeout(()=>{
      input.value = null;
    },100)
  }

  selectedParcipiant(item){
    this.inviteParcipiant.push(item.item)
    let input = <HTMLInputElement>document.getElementById("invite_participants")
    setTimeout(()=>{
      input.value = null;
    },100)
  }

  deleteValidatorOrParcipiant(nickName, path){
    this[path] = this[path].filter(obj => obj.nickName !== nickName);
  }


  onSubmit() {
    this.submitted = true;

    if (this.questionForm.invalid) {
      return;
    }
    

    console.log(this.questionForm.value)
  }

}
