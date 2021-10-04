import auth0 from 'auth0-js';
import * as CryptoJS from 'crypto-js';

const bip39 = require('bip39');
import { DirectSecp256k1HdWallet, Registry } from '@cosmjs/proto-signing';

import { environment } from '../../environments/environment';

const authHelp = {
  init: new auth0.WebAuth({
    domain: 'bettery.us.auth0.com',
    clientID: environment.clientId,
    responseType: 'token id_token',
    redirectUri: `${environment.auth0_URI}/auth`
  }),

  walletInit: async (sub) => {
    const mnemonic = bip39.generateMnemonic(256);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [pubKey] = await wallet.getAccounts();
    // get item
    let data;
    let userData = authHelp.walletDectypt();
    if (userData) {
      data = userData;
    } else {
      data = {
        login: null,
        users: []
      };
    }

    data.login = sub
    data.users.push({
      pubKey,
      mnemonic,
      sub
    })

    console.log(data);
    const bytes = CryptoJS.AES.encrypt(JSON.stringify(data), environment.secretKey);
    localStorage.setItem('_buserlog', bytes.toString());
    authHelp.walletUser = { mnemonic, pubKey: pubKey.address };
  },

  walletUser: null,

  generatePubKey: async (mnemonic) => {
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
      const [pubKey] = await wallet.getAccounts();
      return pubKey;
    } catch (err) {
      return { address: 'not correct' };
    }
  },

  walletDectypt: () => {
    const data = localStorage.getItem('_buserlog');
    if (data) {
      return JSON.parse(CryptoJS.AES.decrypt(data, environment.secretKey).toString(CryptoJS.enc.Utf8));
    }
  },

  saveAccessTokenLS: (token, pubKey, mnemonic, sub) => {
    let index;
    let obj: any = authHelp.walletDectypt();
    console.log(obj);

    if (!obj) {
      obj = {
        login: sub,
        users: [{
          sub: sub,
          accessToken: null,
          pubKey: null,
          mnemonic: null
        }]
      };
      index = 0;
    } else {
      index = obj.users.findIndex((x) => { return x.sub == sub })
    }

    if (index == -1 && pubKey && mnemonic) {
      obj.login = sub;
      obj.users.push({
        sub: sub,
        accessToken: token,
        pubKey: pubKey,
        mnemonic: mnemonic
      })
    }
    // CHECK
    if (token && !pubKey && !mnemonic) {
      obj.users[index].accessToken = token;
      obj.login = sub;
    }

    const bytes = CryptoJS.AES.encrypt(JSON.stringify(obj), environment.secretKey);
    localStorage.setItem('_buserlog', bytes.toString());
  },
  setMemo: (data: any) => {
    authHelp.walletUser = { mnemonic: data.mnemonic, pubKey: data.pubKey.address };
  }
};

export default authHelp;
