import {PayoutParcticipantAnsw} from './PayoutParcticipantAnsw.model';

export interface PayoutEvent {
  allReferals: number;
  finalAnswerNumber: number;
  finishTime: number;
  parcipiantsAnswer: [PayoutParcticipantAnsw];
  question: string;
  room: [{_id: number, color: string, name: string }];
  _id: number;
}
