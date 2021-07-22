import {InvitedUser} from './InvitedUser';

export interface ReferralsUsersModel{
  level1: number;
  level2: number;
  level3: number;
  usersInvited: [InvitedUser]| undefined;
  opened: boolean;
}
