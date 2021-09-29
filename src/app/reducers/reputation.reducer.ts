
import * as ReputationActions from './../actions/reputation.action';
import {ReputationModel} from '../models/Reputation.model';

export function reputationReducer(state: ReputationModel = null, action: ReputationActions.Actions) {
  switch (action.type) {
    case ReputationActions.SET_REPUTATION:

      return {...state, ...action.payload};
    case ReputationActions.UPDATE_REPUTATION:
      return {...action.payload};
    default:
      return state;
  }
}
