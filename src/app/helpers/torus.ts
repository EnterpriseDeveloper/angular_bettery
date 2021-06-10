import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import Web3 from "web3";
import { environment } from '../../environments/environment';

const web3Obj = {
  login: async (selectedVerifier) => {
    try {
      web3Obj.torusdirectsdk = await init();
      let conf: any = verifierMap(selectedVerifier)
      let loginDetails = await web3Obj.torusdirectsdk.triggerLogin(conf);

      let web3Polygon = await web3Init(loginDetails, environment.maticUrl);
      let web3Main = await web3Init(loginDetails, environment.etherUrl);
      web3Obj.web3 = web3Polygon;
      web3Obj.torus = web3Main;
      web3Obj.loginDetails = loginDetails;
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
    try {
      let conf: any = verifierMap(selectedVerifier)
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
  }
}

const web3Init = async (loginDetails, provider) => {
  let web3 = new Web3(provider);
  const prKey = web3.eth.accounts.privateKeyToAccount('0x' + loginDetails.privateKey);
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
    verifier: "betteryAuth0",
    jwtParams: {
      domain: "https://bettery.us.auth0.com",
      connection: selectedVerifier
    }
  }
};
export default web3Obj;
