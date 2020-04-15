import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from '../../models/User.model';
import _ from 'lodash';
import { Answer } from '../../models/Answer.model';
import Web3 from 'web3';
import Contract from '../../contract/contract';
import LoomEthCoin from '../../contract/LoomEthCoin';
import * as CoinsActios from '../../actions/coins.actions';
import * as UserActions from '../../actions/user.actions';
import ERC20 from '../../contract/ERC20';
import { PostService } from '../../services/post.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';

import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'quiz-template',
  templateUrl: './quiz-template.component.html',
  styleUrls: ['./quiz-template.component.sass']
})
export class QuizTemplateComponent implements OnInit {
  userWallet: string;
  faCheck = faCheck;

  errorValidator = {
    idError: null,
    message: undefined
  }

  registError = false;

  constructor(
    private postService: PostService,
    private store: Store<AppState>,
  ) { }


  @Input() question: Object[];
  @Input() userData: User;
  @Input() myAnswers: Answer;
  @Input() coinInfo: any;
  @Input() fromComponent: string;

  @Output() callGetData = new EventEmitter();
  @Output() deleteInvitationId = new EventEmitter<number>();



  ngOnInit() {
    this.userWallet = this.userData.wallet;
  }

  getPosition(data) {
    let findParticipiant = _.findIndex(data.parcipiantAnswers, { "wallet": this.userWallet })
    if (findParticipiant !== -1) {
      if (data.host == this.userWallet || data.host == true) {
        return 'Host, Participiant'
      } else {
        return "Participiant"
      }
    } else {
      let findValidator = _.findIndex(data.validatorsAnswers, { "wallet": this.userWallet })
      if (findValidator !== -1) {
        if (data.host == this.userWallet) {
          return 'Host, Validator'
        } else {
          return "Validator"
        }
      } else {
        let findInParticInvites = _.findIndex(this.userData.listParticipantEvents, { "event": data.id })
        if (findInParticInvites !== -1) {
          return "invited as participiant"
        } else {
          let findInValidatorInvites = _.findIndex(this.userData.listValidatorEvents, { "event": data.id })
          if (findInValidatorInvites !== -1) {
            return 'invited as validator'
          } else {
            if (data.host == this.userWallet || data.host == true) {
              return 'Host'
            } else {
              return "Guest"
            }
          }
        }
      }
    }
  }

  getValidatorsPercentage(questionData, answerIndex) {
    if (questionData.validatorsAnswers !== undefined) {
      let quantity = questionData.validatorsAnswers.filter((x) => x.answer === answerIndex);
      return ((quantity.length / Number(questionData.validated)) * 100).toFixed(0);
    } else {
      return 0
    }
  }

  getParticipantsPercentage(questionData, answerIndex) {
    if (questionData.parcipiantAnswers !== undefined) {
      let quantity = questionData.parcipiantAnswers.filter((x) => x.answer === answerIndex);
      return ((quantity.length / Number(questionData.answerAmount)) * 100).toFixed(0);
    } else {
      return 0
    }
  }

  participantGuard(data) {
    if (data.showDistribution === true) {
      return true
    } else {
      if (this.myAnswers.answered === true) {
        return true
      } else {
        return false
      }
    }
  }

  validatorGuard(data) {
    if (data.finalAnswer !== null) {
      return true
    } else {
      if (this.getPosition(data) === "Guest") {
        return false
      } else if (this.getPosition(data) === 'invited as validator') {
        return false
      } else {
        return true
      }
    }
  }

  validationGuard(data) {
    let timeNow = Number((new Date().getTime() / 1000).toFixed(0))
    if (data.finalAnswer === null) {
      if (data.endTime <= timeNow && data.hostWallet === this.userWallet) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  timeGuard(data) {
    let dateNow = Number((new Date().getTime() / 1000).toFixed(0));
    if (data.startTime > dateNow) {
      return true
    } else {
      return false;
    }
  }

  nameGuard(data) {
    let timeNow = Number((new Date().getTime() / 1000).toFixed(0))
    if (data >= timeNow) {
      return "Participate"
    } else {
      return "Validate"
    }
  }

  getEndValidation(data) {
    let date = new Date(data.endTime * 1000);
    let x = date.setDate(date.getDate() + 7);
    return Number((new Date(x).getTime() / 1000).toFixed(0));
  }

  makeAnswer(i) {
    this.myAnswers.answer = i;
    this.errorValidator.idError = null;
    this.errorValidator.message = undefined;
  }

  setAnswer(dataAnswer) {
    let answer = this.myAnswers;
    if (this.userWallet != undefined) {
      this.registError = false;
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
          if (this.nameGuard(dataAnswer.endTime) === "Participate") {
            this.setToLoomNetwork(answer, dataAnswer);
          } else {
            this.setToLoomNetworkValidation(answer, dataAnswer)
          }
        }
      }
    } else {
      this.registError = true;
    }

  }

  async setToLoomNetwork(answer, dataAnswer) {
    let balance = dataAnswer.tokenPay ? this.coinInfo.loomBalance : this.coinInfo.tokenBalance
    if (Number(balance) < dataAnswer.money) {
      this.errorValidator.idError = dataAnswer.id
      let currency = dataAnswer.tokenPay ? "Ether" : "Tokens."
      this.errorValidator.message = "Don't have enough " + currency
    } else {
      let web3 = new Web3();
      let contract = new Contract();
      var _question_id = dataAnswer.id;
      var _whichAnswer = answer.answer;
      var _money = web3.utils.toWei(String(dataAnswer.money), 'ether')
      let contr = await contract.initContract()
      let validator = await contr.methods.setTimeAnswer(_question_id).call();
      if (Number(validator) === 0) {
        if (!dataAnswer.tokenPay) {
          await this.approveToken(_money)
        }
        let sendToContract = await contr.methods.setAnswer(_question_id, _whichAnswer).send({
          value: dataAnswer.tokenPay ? _money : 0
        });
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
  }

  async approveToken(amount) {
    let contract = new Contract();
    let quizAddress = contract.quizeAddress();
    return await contract.approve(quizAddress, amount);
  }


  setToDB(answer, dataAnswer, transactionHash) {
    let data = {
      multy: answer.multy,
      event_id: answer.event_id,
      date: new Date(),
      answer: answer.answer,
      multyAnswer: answer.multyAnswer,
      transactionHash: transactionHash,
      userId: this.userData._id,
      from: "participant",
      answerAmount: dataAnswer.answerAmount + 1,
      money: dataAnswer.money
    }
    this.postService.post("answer", data).subscribe(async () => {
      this.myAnswers.answered = true;
      this.errorValidator.idError = null;
      this.errorValidator.message = undefined;

      this.updateUser();
      this.callGetData.next();

      let web3 = new Web3(window.web3.currentProvider);
      let loomEthCoinData = new LoomEthCoin()
      await loomEthCoinData.load(web3)

      this.coinInfo = await loomEthCoinData._updateBalances()
      let ERC20Connection = new ERC20()
      await ERC20Connection.load(web3)
      let ERC20Coins = await ERC20Connection._updateBalances();
      this.store.dispatch(new CoinsActios.UpdateCoins({
        loomBalance: this.coinInfo.loomBalance,
        mainNetBalance: this.coinInfo.mainNetBalance,
        tokenBalance: ERC20Coins.loomBalance
      }))

    },
      (err) => {
        console.log(err)
      })
  }

  async setToLoomNetworkValidation(answer, dataAnswer) {

    let contract = new Contract();
    var _question_id = dataAnswer.id;
    var _whichAnswer = answer.answer;
    let contr = await contract.initContract()
    let validator = await contr.methods.setTimeValidator(_question_id).call();

    switch (Number(validator)) {
      case 0:
        let sendToContract = await contr.methods.setValidator(_question_id, _whichAnswer).send();
        if (sendToContract.transactionHash !== undefined) {
          this.setToDBValidation(answer, dataAnswer, sendToContract.transactionHash)
        }
        break;
      case 1:
        this.errorValidator.idError = dataAnswer.id
        this.errorValidator.message = "Event not started yeat."
        break;
      case 2:
        this.errorValidator.idError = dataAnswer.id
        this.errorValidator.message = "Event is finished."
        break;
      case 3:
        this.errorValidator.idError = dataAnswer.id
        this.errorValidator.message = "You have been like the participant in this event. The participant can't be the validator."
        break;
    }
  }

  setToDBValidation(answer, dataAnswer, transactionHash) {
    let data = {
      multy: answer.multy,
      event_id: answer.event_id,
      date: new Date(),
      answer: answer.answer,
      multyAnswer: answer.multyAnswer,
      transactionHash: transactionHash,
      userId: this.userData._id,
      from: "validator",
      validated: dataAnswer.validated + 1,
      money: dataAnswer.money
    }
    console.log(data);
    this.postService.post("answer", data).subscribe(async () => {
      this.myAnswers.answered = true;
      this.errorValidator.idError = null;
      this.errorValidator.message = undefined;

      this.callGetData.next();

      let web3 = new Web3(window.web3.currentProvider);
      let loomEthCoinData = new LoomEthCoin()
      await loomEthCoinData.load(web3)
      this.coinInfo = await loomEthCoinData._updateBalances()
      let ERC20Connection = new ERC20()
      await ERC20Connection.load(web3)
      let ERC20Coins = await ERC20Connection._updateBalances();
      this.store.dispatch(new CoinsActios.UpdateCoins({
        loomBalance: this.coinInfo.loomBalance,
        mainNetBalance: this.coinInfo.mainNetBalance,
        tokenBalance: ERC20Coins.loomBalance
      }))

    },
      (err) => {
        console.log(err)
      })
  }

  updateUser() {
    let data = {
      wallet: this.userWallet
    }
    this.postService.post("user/validate", data)
      .subscribe(
        (currentUser: User) => {
          this.store.dispatch(new UserActions.UpdateUser({
            _id: currentUser._id,
            email: currentUser.email,
            nickName: currentUser.nickName,
            wallet: currentUser.wallet,
            listHostEvents: currentUser.listHostEvents,
            listParticipantEvents: currentUser.listParticipantEvents,
            listValidatorEvents: currentUser.listValidatorEvents,
            historyTransaction: currentUser.historyTransaction,
            avatar: currentUser.avatar,
            onlyRegistered: false
          }))
        })
  }

  deleteInvitation(data) {
    let id = data.id
    this.deleteInvitationId.next(id)
  }

  whichComponent() {
    if (this.fromComponent === "invitation") {
      return true
    } else {
      return false
    }
  }

  validateDeleteButton(data) {
    if (this.fromComponent === "myEvent") {
      let result = this.getPosition(data);
      let z = result.search("Host")
      if (z !== -1) {
        if (data.answerAmount >= 1) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    } else {
      false
    }
  }

  async deleteEvent(data) {
    let id = data.id
    let contract = new Contract();
    let contr = await contract.initContract()
    let deleteValidator = await contr.methods.deleteEventValidator(id).call();
    if (Number(deleteValidator) === 0) {
    this.letsDeleteEvent(id, contr);
    } else if (Number(deleteValidator) === 1) {
      this.errorValidator.idError = id
      this.errorValidator.message = "You can't delete event because event has money on balance."
    } else if (Number(deleteValidator) === 2) {
      this.errorValidator.idError = id
      this.errorValidator.message = "You are now a owner of event, only owner can delete event."
    }

  }

  async letsDeleteEvent(id, contr) {
    let deleteEvent = await contr.methods.deleteEvent(id).send();
    if (deleteEvent.transactionHash !== undefined) {
      this.deleteFromDb(id);
    } else {
      this.errorValidator.idError = id
      this.errorValidator.message = "error from contract. Check console log."
    }
  }


  finalAnswerGuard(question) {
    if(question.finalAnswer === null || question.reverted === false){
      return false;
    }else{
      return true;
    }
  }

  deleteFromDb(id) {
    let data = {
      id: id
    }
    this.postService.post("delete_event", data)
      .subscribe(() => {
        this.callGetData.next()
      },
        (err) => {
          console.log("from delete wallet")
          console.log(err)
        })
  }

}