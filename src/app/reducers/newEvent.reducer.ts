import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {formDataAction} from '../actions/newEvent.actions';
import {LandingStateInterface} from '../models/landingState.model';

const init = {
  question: '',
  answers: [],
  resolutionDetalis: '',
  whichRoom: 'new',
  roomName: '',
  roomColor: 'linear-gradient(228.16deg, #54DD96 -1.47%, #6360F7 97.79%)',
  eventType: 'public',
  tokenType: 'token',
  winner: '',
  losers: '',
  privateEndTime: '',
  publicEndTime: '',
  expertsCountType: 'company',
  expertsCount: '',
  exactMinutes: new Date().getMinutes(),
  exactHour: new Date().getHours(),
  exactDay: new Date().getDate(),
  exactMonth: new Date().getMonth(),
  exactYear: new Date().getFullYear(),
  exactTimeBool: false,
  roomId: '',
  imgOrColor: 'color',
  thumImage: '',
  thumColor: '',
  thumFinish: ''
};

export const landingFeatureSelector = createFeatureSelector<LandingStateInterface>('event');

export const initialState: LandingStateInterface = {
  formData: init
};

export const createEventReducer = createReducer(
  initialState,
  on(formDataAction,
    (state, action): LandingStateInterface => ({
      ...state,
      formData: action.formData
    })
  )
);
