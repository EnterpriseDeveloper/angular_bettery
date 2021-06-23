import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { User } from './../models/User.model';

export const ADD_USER = "[USER] Add";
export const UPDATE_USER = "[USER] Update";
export const REMOVE_USER = "[USER] Remove";

export class AddUser implements Action{
    readonly type = ADD_USER

    constructor(public payload: User) {}
}

export class UpdateUser implements Action{
    readonly type = UPDATE_USER

    constructor(public payload: User) {}
}

export class RemoveUser implements Action{
    readonly type = REMOVE_USER

    constructor(public payload: number) {}
}

export type Actions = AddUser | RemoveUser | UpdateUser;
