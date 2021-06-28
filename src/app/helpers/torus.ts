import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import Web3 from "web3";
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';

const web3Obj = {
  login: async (selectedVerifier) => {
    let x = selectedVerifier == "google" ? "google-oauth2" : selectedVerifier;
    try {
      web3Obj.torusdirectsdk = await init();
      let conf: any = verifierMap(x)
      let loginDetails = await web3Obj.torusdirectsdk.triggerLogin(conf);

      web3Obj.web3 = await web3Init(loginDetails.privateKey, environment.maticUrl);
      web3Obj.torus = await web3Init(loginDetails.privateKey, environment.etherUrl);

      web3Obj.loginDetails = loginDetails;

      // add to local storage
      let data = {
        privateKey: loginDetails.privateKey,
        publicAddress: loginDetails.publicAddress,
        accessToken: loginDetails.userInfo.accessToken
      }
      const bytes = CryptoJS.AES.encrypt(JSON.stringify(data), environment.secretKey)
      localStorage.setItem('_buserlog', bytes.toString());
      return null;
    } catch (error) {
      return error;
    }
  },
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
    web3Obj.web3 = null;
    web3Obj.torus = null;
    web3Obj.loginDetails = null;
  },
  autoLogin: async (privateKey, publicAddress) => {
    web3Obj.loginDetails = { privateKey, publicAddress };
    web3Obj.web3 = await web3Init(privateKey, environment.maticUrl);
    web3Obj.torus = await web3Init(privateKey, environment.etherUrl);
    console.log(web3Obj.web3);
    return
  }
}

const web3Init = async (privateKey, provider) => {
  console.log(provider);
  let web3 = new Web3(provider);
  const prKey = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
  await web3.eth.accounts.wallet.add(prKey);
  return web3;
}

const init = async () => {
  let torusNetwork: any = environment.torusNetwork;
  let torSdk = new TorusSdk({
    baseUrl: `${location.origin}/serviceworker`,
    enableLogging: true,
    network: torusNetwork
  });

  await torSdk.init();
  return torSdk
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
