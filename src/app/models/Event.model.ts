import {Answer} from './Answer.model';

export interface EventModel {
  allAmountEvents: number;
  amount: number;
  events: Event[];
}

export interface Event {
  answerAmount: number;
  detailOpened: boolean;
  answers: object[];
  commentsAmount: number;
  currencyType: string;
  endTime: number;
  eventEnd: number;
  finalAnswer: any;
  host: {
    avatat: string;
    id: number;
    nickName: string;
    wallet: string;
    mintedAdvisorAmount: number;
    mintedHostAmount: number;
    payAdvisorAmount: number;
    payHostAmount: number;
  };
  id: number;
  lastComment: string;
  parcipiantAnswers: ParcipiantAnswers[];
  question: string;
  room: {
    color: string;
    eventAmount: number;
    id: number;
    name: string;
    owner: number;
  };
  startTime: number;
  status: string;
  transactionHash: string;
  validated: number;
  validatorsAmount: number;
  thumColor: string;
  thumImage: string;
  thumFinish: string;
  validatorsAnswers: ValidatorsAnswers[];
  usersAnswers: Answer;
}
export interface ValidatorsAnswers {
  answer: number;
  avatar: string;
  date: number;
  transactionHash: string;
  userId: number;
  payToken: number | undefined;
  mintedToken: number | undefined;
  premiumToken: number | undefined;
}
export interface ParcipiantAnswers {
  amount: number;
  answer: number;
  avatar: string;
  date: number;
  transactionHash: string;
  userId: number;
  payToken: number | undefined;
  mintedToken: number | undefined;
  premiumToken: number | undefined;
}

