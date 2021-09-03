import {Action} from '@ngrx/store';
import {ReputationModel} from '../models/Reputation.model';


export const SET_REPUTATION = "[REPUTATION] Set";
export const UPDATE_REPUTATION = "[REPUTATION] UPDATE";

export class SetReputation implements Action{
  readonly type = SET_REPUTATION;

  constructor(public payload: ReputationModel) {}
}

export class UpdateReputation implements Action{
  readonly type = UPDATE_REPUTATION;

  constructor(public payload: ReputationModel) {}
}

export type Actions = SetReputation | UpdateReputation;
