import auth0 from 'auth0-js';
import * as CryptoJS from 'crypto-js';
const bip39 = require('bip39');
import {DirectSecp256k1HdWallet, Registry} from '@cosmjs/proto-signing';

import { environment } from '../../environments/environment';

const authHelp = {
  init: new auth0.WebAuth({
      domain: 'bettery.us.auth0.com',
      clientID: '49atoPMGb9TWoaDflncmvPQOCccRWPyf',
      responseType: 'id_token',
      redirectUri: 'http://localhost:4200/auth'
    }),

  walletInit: async () => {
    const mnemonic = bip39.generateMnemonic(256);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [pubKey] = await wallet.getAccounts();

    const bytes = CryptoJS.AES.encrypt(JSON.stringify(pubKey), environment.secretKey)
    localStorage.setItem('_buserlog', bytes.toString());
    // todo return publicKey
    return pubKey.address;
  }
};

export default authHelp;
