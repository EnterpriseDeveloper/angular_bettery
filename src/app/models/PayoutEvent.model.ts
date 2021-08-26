import {PayoutParcticipantAnsw} from "./PayoutParcticipantAnsw.model";

export interface PayoutEvent {
  allReferals: number;
  finalAnswerNumber: number;
  finishTime: number;
  parcipiantsAnswer: [PayoutParcticipantAnsw];
  question: string;
  room: any[];
  _id: number;
}
