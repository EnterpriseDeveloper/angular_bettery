import auth0 from 'auth0-js';
import * as CryptoJS from 'crypto-js';

const bip39 = require('bip39');
import {DirectSecp256k1HdWallet, Registry} from '@cosmjs/proto-signing';

import {environment} from '../../environments/environment';

const authHelp = {
  init: new auth0.WebAuth({
    domain: 'bettery.us.auth0.com',
    clientID: '49atoPMGb9TWoaDflncmvPQOCccRWPyf',
    responseType: 'token id_token',
    redirectUri: `${environment.auth0_URI}/auth`
  }),

  walletInit: async () => {
    const mnemonic = bip39.generateMnemonic(256);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [pubKey] = await wallet.getAccounts();

    const bytes = CryptoJS.AES.encrypt(JSON.stringify({pubKey, mnemonic}), environment.secretKey);
    localStorage.setItem('_buserlog', bytes.toString());
    authHelp.walletUser = {mnemonic, pubKey: pubKey.address};
  },

  walletUser: null,

  generatePubKey: async (mnemonic) => {
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
      const [pubKey] = await wallet.getAccounts();
      return pubKey;
    }catch (err){
      return {address: 'not correct'};
    }
  },

  walletDectypt: () => {
    const data = localStorage.getItem('_buserlog');
    if (data) {
      return JSON.parse(CryptoJS.AES.decrypt(data, environment.secretKey).toString(CryptoJS.enc.Utf8));
    }
  },

  saveAccessTokenLS: (token, pubKey, mnemonic) => {
    let obj: any = authHelp.walletDectypt();
    if (obj === undefined) {
      obj = {};
    }
    if (token) {
      obj.accessToken = token;
    }
    if (pubKey && mnemonic) {
      obj.pubKey = pubKey;
      obj.mnemonic = mnemonic;
    }
    const bytes = CryptoJS.AES.encrypt(JSON.stringify(obj), environment.secretKey);
    localStorage.setItem('_buserlog', bytes.toString());
  }
};

export default authHelp;
