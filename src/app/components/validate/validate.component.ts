import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { Router } from "@angular/router";
import { GetService } from '../../services/get.service';
import * as moment from 'moment';
import { Answer } from '../../models/Answer.model';
import _ from 'lodash';
import Web3 from 'web3';
import Contract from '../../services/contract';
import { PostService } from '../../services/post.service';
import LoomEthCoin from '../../services/LoomEthCoin';
import * as CoinsActios from '../../actions/coins.actions';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { interval } from 'rxjs';


@Component({
  selector: 'validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.sass']
})
export class ValidateComponent {
  private spinner: boolean = true;
  private questions: any;
  myAnswers: Answer[] = [];
  userWallet: any;
  coinInfo = null;
  faCheck = faCheck;
  errorValidator = {
    idError: null,
    message: undefined
  }




  constructor(
    private store: Store<AppState>,
    private router: Router,
    private getService: GetService,
    private postService: PostService
  ) {
    this.store.select("user").subscribe((x) => {
      if (x.length === 0) {
        this.router.navigate(['~ki339203/home'])
      } else {
        this.userWallet = x[0].wallet
        this.getData();
      }
    });
    this.store.select("coins").subscribe((x) => {
      if (x.length !== 0) {
        this.coinInfo = x[0];
      }
    })
    // interval(1000).subscribe(x => {
    //   this.timeGuardText(x);
    // });
  }

  getData() {
    this.getService.get("question/get_all_private").subscribe((x) => {
      this.questions = _.orderBy(x, ['endTime'], ['asc']);
      this.questions.forEach((data, i) => {
        let z = {
          event_id: data.id,
          answer: this.findAnswer(data),
          from: data.from,
          multy: data.multiChose,
          answered: this.findAnswered(data),
          multyAnswer: this.findMultyAnswer(data)
        }

        this.myAnswers.push(z);
        this.spinner = false;
      });
      console.log(this.questions)
    })
  }


  findMultyAnswer(data) {
    let z = []
    let search = _.filter(data.validatorsAnswers, { 'wallet': this.userWallet });
    search.forEach((x) => {
      z.push(x.answer)
    })
    return z
  }

  findAnswer(data) {
    let findParticipiant = _.findIndex(data.validatorsAnswers, { "wallet": this.userWallet })
    return findParticipiant !== -1 ? data.validatorsAnswers[findParticipiant].answer : undefined;
  }

  findAnswered(data) {
    if (data.multiChose) {
      return this.findMultyAnswer(data).length !== 0 ? true : false;
    } else {
      return this.findAnswer(data) !== undefined ? true : false;
    }
  }


  getParticipantsPercentage(answerIndex, questionIndex) {
    if (this.questions[questionIndex].parcipiantAnswers !== undefined) {
      let quantity = this.questions[questionIndex].parcipiantAnswers.filter((x) => x.answer === answerIndex);
      return ((quantity.length / Number(this.questions[questionIndex].answerQuantity)) * 100).toFixed(0); 
    } else {
      return 0
    }
  }

  getValidatorsPercentage(answerIndex, questionIndex){
    if (this.questions[questionIndex].validatorsAnswers !== undefined) {
      let quantity = this.questions[questionIndex].validatorsAnswers.filter((x) => x.answer === answerIndex);
      return ((quantity.length / Number(this.questions[questionIndex].validatorsQuantity)) * 100).toFixed(0); 
    } else {
      return 0
    }
  }

  getParticipationTime(data) {
    let date = new Date(data.startTime * 1000);
    return moment(date, "YYYYMMDD").fromNow();
  }

  getValidationTime(data) {
    let date = new Date(data.endTime * 1000);
    return moment(date, "YYYYMMDD").fromNow();
  }

  getEndValidation(data) {
    let date = new Date(data.endTime * 1000);
    date.setDate(date.getDate() + 7);
    return moment(date, "YYYYMMDD").fromNow();
  }

  timeGuardText(data) {
    let dateNow = Number((new Date().getTime() / 1000).toFixed(0));
    if (data.endTime > dateNow) {
      let date = new Date(data.endTime * 1000);
      return "Start " + moment(date, "YYYYMMDDhhmm").fromNow() + (data.endTime - dateNow);
    } else {
      return "Validate now!";
    }

  }

  timeGuard(data) {
    let dateNow = Number((new Date().getTime() / 1000).toFixed(0));
    if (data.endTime > dateNow) {
      return true
    } else {
      return false;
    }
  }

  makeAnswer(data, i) {
    let index = _.findIndex(this.myAnswers, { 'event_id': data.id, 'from': data.from });
    this.myAnswers[index].answer = i;
    this.errorValidator.idError = null;
    this.errorValidator.message = undefined;
  }

  setAnswer(dataAnswer) {
    let answer = _.find(this.myAnswers, { 'event_id': dataAnswer.id, 'from': dataAnswer.from });
    if (answer.multy) {
      if (answer.multyAnswer.length === 0) {
        this.errorValidator.idError = dataAnswer.id
        this.errorValidator.message = "Chose at leas one answer"
      } else {
        // multy answer
        //  this.setToDB(answer, dataAnswer)
      }
    } else {
      if (answer.answer === undefined) {
        this.errorValidator.idError = dataAnswer.id
        this.errorValidator.message = "Chose at leas one answer"
      } else {
        this.setToLoomNetwork(answer, dataAnswer);
      }
    }
  }

  async setToLoomNetwork(answer, dataAnswer) {

    let contract = new Contract();
    var _question_id = dataAnswer.id;
    var _whichAnswer = answer.answer;
    let contr = await contract.initContract()
    let validator = await contr.methods.setTimeValidator(_question_id).call();
    console.log(validator);
    if (Number(validator) === 0) {
      let sendToContract = await contr.methods.setValidator(_question_id, _whichAnswer).send();
      if (sendToContract.transactionHash !== undefined) {
        this.setToDB(answer, dataAnswer, sendToContract.transactionHash)
      }
    } else if (Number(validator) === 1) {
      this.errorValidator.idError = dataAnswer.id
      this.errorValidator.message = "Event not started yeat."
    } else if (Number(validator) === 2) {
      this.errorValidator.idError = dataAnswer.id
      this.errorValidator.message = "Already finished"
    }

  }


  setToDB(answer, dataAnswer, transactionHash) {
    let data = {
      multy: answer.multy,
      event_id: answer.event_id,
      date: new Date(),
      answer: answer.answer,
      multyAnswer: answer.multyAnswer,
      transactionHash: transactionHash,
      wallet: this.userWallet,
      from: "validator",
      validatorsQuantity: dataAnswer.validatorsQuantity + 1
    }
    console.log(data);
    this.postService.post("answer", data).subscribe(async () => {
      let index = _.findIndex(this.myAnswers, { 'event_id': dataAnswer.id, 'from': dataAnswer.from });
      this.myAnswers[index].answered = true;

      this.getData();
      let web3 = new Web3(window.web3.currentProvider);
      let loomEthCoinData = new LoomEthCoin()
      await loomEthCoinData.load(web3)

      this.coinInfo = await loomEthCoinData._updateBalances()
      console.log(this.coinInfo)
      this.store.dispatch(new CoinsActios.UpdateCoins({ loomBalance: this.coinInfo.loomBalance, mainNetBalance: this.coinInfo.mainNetBalance }))

    },
      (err) => {
        console.log(err)
      })
  }


}

