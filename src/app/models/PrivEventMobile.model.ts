export interface PrivEventMobile {
  answers: object[];
  endTime: number;
  finalAnswer: string;
  finalAnswerNumber: number;
  host: {
    id: number;
    avatat: string;
    nickName: string;
    wallet: string;
  };
  id: number;
  loser: string;
  parcipiantAnswers: ParcipiantAnswers[];
  question: string;
  room: {
    color: string;
    name: string;
    owner: number;
  };
  startTime: number;
  status: string;
  transactionHash: string;
  winner: string;
  validatorsAmount: number;
  validatorAnswer: ValidatorsAnswers[];
  resolutionDetalis: string;
  thumColor: string;
  thumImage: string;
}

interface ParcipiantAnswers {
  answer: number;
  avatar: string;
  date: number;
  transactionHash: string;
  userId: number;
}

interface ValidatorsAnswers {
  answer: number;
  avatar: string;
  date: number;
  transactionHash: string;
  userId: number;
}
