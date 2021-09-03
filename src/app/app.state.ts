import {User} from './models/User.model';
import {Coins} from './models/Coins.model';
import { LandingStateInterface } from './models/landingState.model';

export interface AppState {
    readonly user: User[];
    readonly coins: Coins[];
    readonly createEvent: LandingStateInterface
}