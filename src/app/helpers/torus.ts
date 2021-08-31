import Web3 from "web3";
import { environment } from '../../environments/environment';

const web3Obj = {
  // login: async (selectedVerifier) => {
  //   let x = selectedVerifier == "google" ? "google-oauth2" : selectedVerifier;
  //   try {
  //     let conf: any = verifierMap(x)
  //     let loginDetails = await web3Obj.torusdirectsdk.triggerLogin(conf);

  //     web3Obj.web3 = await web3Init(loginDetails.privateKey, environment.maticUrl);
  //     web3Obj.torus = await web3Init(loginDetails.privateKey, environment.etherUrl);

  //     web3Obj.loginDetails = loginDetails;

  //     // add to local storage
  //     let data = {
  //       privateKey: loginDetails.privateKey,
  //       publicAddress: loginDetails.publicAddress,
  //       accessToken: loginDetails.userInfo.accessToken
  //     }
  //     const bytes = CryptoJS.AES.encrypt(JSON.stringify(data), environment.secretKey)
  //     localStorage.setItem('_buserlog', bytes.toString());
  //     return null;
  //   } catch (error) {
  //     return error;
  //   }
  // },
  torusdirectsdk: null,
  torus: null, // main ehter
  web3: null, // polygon
  loginDetails: null,
  linkUser: async (selectedVerifier) => {
    let x = selectedVerifier == "google" ? "google-oauth2" : selectedVerifier;
    try {
      let conf: any = verifierMap(x)
      let data = await web3Obj.torusdirectsdk.triggerLogin(conf);
      return { data: data, err: false }
    } catch (err) {
      return { data: null, err: err }
    }
  },
  logOut: () => {
    localStorage.removeItem('_buserlog');
    web3Obj.web3 = null;
    web3Obj.torus = null;
    web3Obj.loginDetails = null;
  },
  autoLogin: async (privateKey, publicAddress) => {
    web3Obj.loginDetails = { privateKey, publicAddress };
    web3Obj.web3 = await web3Init(privateKey, environment.maticUrl);
    web3Obj.torus = await web3Init(privateKey, environment.etherUrl);
    return
  }
}

const web3Init = async (privateKey, provider) => {
  let web3 = new Web3(provider);
  const prKey = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
  await web3.eth.accounts.wallet.add(prKey);
  return web3;
}

const getRedirect = () => {
  if (/CriOS/i.test(navigator.userAgent) && /iphone|ipod|ipad/i.test(navigator.userAgent)) {
    return 'redirect.html';
  } else {
    return undefined;
  }
}




const verifierMap = (selectedVerifier) => {
  return {
    name: "bettery",
    typeOfLogin: "jwt",
    clientId: "49atoPMGb9TWoaDflncmvPQOCccRWPyf",
    verifier: environment.torusVerifierId,
    jwtParams: {
      domain: "https://bettery.us.auth0.com",
      connection: selectedVerifier == "email" ? null : selectedVerifier
    }
  }
};
export default web3Obj;
