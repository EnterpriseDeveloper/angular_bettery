export interface Answer {
  event_id: number;
  answer: number;
  from: string;
  answered: boolean;
  amount: number | string;
  betAmount: number;
  mintedToken: number;
  payToken: number;
  answerName: string;
}
