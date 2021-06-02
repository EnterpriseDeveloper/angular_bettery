import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import Web3 from "web3";
import { environment } from '../../environments/environment';

let loginHint = "";

const web3Obj = {
  login: async (selectedVerifier) => {
    try {
      let torusdirectsdk = await init();
      const jwtParams = _loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      let loginDetails = await torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });

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
  torus: null, // main ehter
  web3: null, // polygon
  loginDetails: null,
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

  await torSdk.init({ skipSw: false });
  return torSdk
}

const _loginToConnectionMap = () => {
  return {
    [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
    [PASSWORDLESS]: { domain: AUTH_DOMAIN, login_hint: loginHint },
    [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
    [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
    [APPLE]: { domain: AUTH_DOMAIN },
    [LINKEDIN]: { domain: AUTH_DOMAIN },
    [TWITTER]: { domain: AUTH_DOMAIN }
  };
};




const GOOGLE = "google";
const FACEBOOK = "facebook";
const REDDIT = "reddit";
const DISCORD = "discord";
const TWITCH = "twitch";
const APPLE = "apple";
const LINKEDIN = "linkedin";
const TWITTER = "twitter";
const EMAIL_PASSWORD = "email_password";
const PASSWORDLESS = "passwordless";
const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";
const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";
const WEBAUTHN = "webauthn";

const verifierMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    clientId: environment.googleId,
    verifier: environment.verifierGoogle,
  },
  [FACEBOOK]: { name: "Facebook", typeOfLogin: "facebook", clientId: "1183222495454711", verifier: "bettery-facebook-test" },
  [REDDIT]: { name: "Reddit", typeOfLogin: "reddit", clientId: "Z1vp1iGcy1AYfPlVWcO-UE_Xlk0ctw", verifier: "bettery-reddit-test" },
  [TWITCH]: { name: "Twitch", typeOfLogin: "twitch", clientId: "00x4niz79js6mke5mensaa6ywunssm", verifier: "bettery-twitch-test" },
  [DISCORD]: { name: "Discord", typeOfLogin: "discord", clientId: "848876046170062878", verifier: "bettery-discord-test" },
  [EMAIL_PASSWORD]: {
    name: "Email Password",
    typeOfLogin: "email_password",
    clientId: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",
    verifier: "torus-auth0-email-password",
  },
  [PASSWORDLESS]: {
    name: "Passwordless",
    typeOfLogin: "passwordless",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-auth0-passwordless",
  },
  [APPLE]: { name: "Apple", typeOfLogin: "apple", clientId: "m1Q0gvDfOyZsJCZ3cucSQEe9XMvl9d9L", verifier: "torus-auth0-apple-lrc" },
  [LINKEDIN]: { name: "Linkedin", typeOfLogin: "linkedin", clientId: "78lhd7bb1pqn2i", verifier: "better_linkedin_test", jwtParams: { domain: "https://www.bettery.io" } },
  [TWITTER]: { name: "Twitter", typeOfLogin: "twitter", clientId: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO", verifier: "torus-auth0-twitter-lrc" },
  [HOSTED_EMAIL_PASSWORDLESS]: {
    name: "Hosted Email Passwordless",
    typeOfLogin: "jwt",
    clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
    verifier: "torus-auth0-passwordless",
  },
  [HOSTED_SMS_PASSWORDLESS]: {
    name: "Hosted SMS Passwordless",
    typeOfLogin: "jwt",
    clientId: "nSYBFalV2b1MSg5b2raWqHl63tfH3KQa",
    verifier: "torus-auth0-sms-passwordless",
  },
  [WEBAUTHN]: {
    name: "WebAuthn",
    typeOfLogin: "webauthn",
    clientId: "webauthn",
    verifier: "webauthn-lrc",
  },
};

const AUTH_DOMAIN = "https://torus-test.auth0.com";

export default web3Obj;
