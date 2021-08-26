import {PayoutEvent} from "./PayoutEvent.model";

export interface Payouts {
  data: [PayoutEvent];
  eventsAmount: number;
  totalBet: number;
  totalBet24: number;
}
