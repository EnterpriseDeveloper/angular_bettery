import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { Router } from "@angular/router"
import { PostService } from '../../services/post.service';
import { Answer } from '../../models/Answer.model';
import _ from 'lodash';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { NgbTabsetConfig, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'my-activites',
  templateUrl: './my-activites.component.html',
  styleUrls: ['./my-activites.component.sass'],
  providers: [NgbTabsetConfig]
})
export class MyActivitesComponent implements OnInit {
  faCheck = faCheck;
  userWallet: string = undefined;
  allData: any = [];
  myActivites: any = [];
  spinner: boolean = true;
  hostFilet: boolean = true;
  parcipiantFilter: boolean = true;
  validateFilter: boolean = true;
  myAnswers: Answer[] = [];
  idErrorMoney: number = null;
  coinInfo = null;
  spinnerAnswer: number = 0;
  pathForApi = 'current';
  userData: any = [];
  UserSubscribe;
  CoinsSubscribe;
  fromComponent = "myEvent";

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private postService: PostService,
    tabs: NgbTabsetConfig
  ) {
    tabs.justify = 'center';
    this.UserSubscribe = this.store.select("user").subscribe((x) => {
      if (x.length === 0) {
        this.router.navigate(['~ki339203/home'])
      } else {
        this.userWallet = x[0].wallet
        this.userData = x[0];
      }
    });
    this.CoinsSubscribe = this.store.select("coins").subscribe((x) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
      }
    })
  }

  ngOnInit() {
    if (this.userWallet != undefined) {
      this.getDataFromDb(this.pathForApi);
    }
  }

  getDataDbComponent(){
    this.getDataFromDb(this.pathForApi);
  }

  tabChange($event: NgbTabChangeEvent) {
    this.hostFilet = true;
    this.parcipiantFilter = true;
    this.validateFilter = true;
    switch ($event.nextId) {
      case 'current_events':
        this.pathForApi = 'current';
        this.spinner = true;
        this.getDataFromDb("current");
        break;
      case 'past_events':
        this.pathForApi = 'past';
        this.spinner = true;
        this.getDataFromDb("past");
        break;
    }
  }

  getDataFromDb(from) {
    let data = {
      id: this.userData._id
    }
    this.postService.post("my_activites/" + from, data)
      .subscribe(async (x) => {
        this.myAnswers = [];
        this.myActivites = x
        this.allData = x;
        this.allData.forEach((data, i) => {
          let z = {
            event_id: data.id,
            answer: this.findAnswer(data),
            from: data.from,
            multy: data.multiChoise,
            answered: this.findAnswered(data),
            multyAnswer: this.findMultyAnswer(data)
          }

          this.myAnswers.push(z);
        });
        this.spinner = false;
      }, (err) => {
        console.log(err);
      })
  }

  findMultyAnswer(data) {
    let z = []
    let part = _.filter(data.parcipiantAnswers, { 'wallet': this.userWallet });
    part.forEach((x) => {
      z.push(x.answer)
    })
    if (z.length === 0) {
      let part = _.filter(data.validatorsAnswers, { 'wallet': this.userWallet });
      part.forEach((x) => {
        z.push(x.answer)
      })
      return z;
    } else {
      return z;
    }
  }

  findAnswer(data) {
    let findParticipiant = _.findIndex(data.parcipiantAnswers, { "wallet": this.userWallet })
    if (findParticipiant === -1) {
      let findValidators = _.findIndex(data.validatorsAnswers, { "wallet": this.userWallet })
      return findValidators !== -1 ? data.validatorsAnswers[findValidators].answer : undefined;
    } else {
      return data.parcipiantAnswers[findParticipiant].answer
    }
  }

  findAnswered(data) {
    if (data.multiChoise) {
      return this.findMultyAnswer(data).length !== 0 ? true : false;
    } else {
      return this.findAnswer(data) !== undefined ? true : false;
    }
  }

  filter() {
    setTimeout(() => {
      let data = this.allData
      if (!this.hostFilet) {
        data = data.filter((x) => x.host !== true);
      }
      if (!this.parcipiantFilter) {
        data = data.filter((x) => x.from !== "participant");
      }
      if (!this.validateFilter) {
        data = data.filter((x) => x.from !== "validator");
      }

      this.myAnswers = data.map((data, i) => {
        return {
          event_id: data.id,
          answer: this.findAnswer(data),
          from: data.from,
          multy: data.multiChoise,
          answered: this.findAnswered(data),
          multyAnswer: this.findMultyAnswer(data)
        }
      })

      this.myActivites = data;
    }, 100)
  }

  getActiveQuantity(from) {
    let data
    if (from === "Host") {
      data = this.allData.filter((x) => x.host === true);
    } else {
      data = this.allData.filter((x) => x.from === from);
    }
    return data.length
  }



  ngOnDestroy() {
    this.UserSubscribe.unsubscribe();
    this.CoinsSubscribe.unsubscribe();
  }

}
