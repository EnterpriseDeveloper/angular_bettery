import {createAction, props} from '@ngrx/store';

export enum ActionTypes {
  FORM_DATA = '[DATA] Form_data'
}

export const formDataAction = createAction(
  ActionTypes.FORM_DATA,
  props<{formData: string}>()
);
