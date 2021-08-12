export interface CommentModel {
  activites: number;
  angry: object[];
  comment: string;
  date: number;
  id: number;
  replies: object[];
  smile: object[];
  star: object[];
  user: UserComModel;
  wink: object[];
}

interface UserComModel {
  avatar: string;
  id: number;
  nickName: string;
}
