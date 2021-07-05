export interface User {
    _id: number;
    nickName: string;
    email: string;
    wallet: string;
    avatar: string;
    verifier: string;
    verifierId: string;
    sessionToken: string | undefined;
    accessToken: string | undefined;
}
