import {User} from './models/User.model';
import {Coins} from './models/Coins.model';
import { LandingStateInterface } from './models/landingState.model';
import {ReputationModel} from './models/Reputation.model';

export interface AppState {
    readonly user: User[];
    readonly coins: Coins[];
    readonly createEvent: LandingStateInterface;
    readonly reputation: ReputationModel;
}
