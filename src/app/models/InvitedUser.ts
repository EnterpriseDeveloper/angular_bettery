export interface InvitedUser{
  avatar: string;
  nickName: string;
  invited: [InvitedUser]|undefined;
  registered: number;
  _id: number;
  opened: boolean;
  thirdLvlRefs: number;
}
