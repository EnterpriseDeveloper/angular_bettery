import OpenLogin from "@toruslabs/openlogin";

const GOOGLE = "google";
const FACEBOOK = "facebook";
const REDDIT = "reddit";
const DISCORD = "discord";
const TWITCH = "twitch";
const GITHUB = "github";
const APPLE = "apple";
const LINKEDIN = "linkedin";
const TWITTER = "twitter";
const WEIBO = "weibo";
const LINE = "line";
const EMAIL_PASSWORD = "email_password";
const PASSWORDLESS = "passwordless";
const HOSTED_EMAIL_PASSWORDLESS = "hosted_email_passwordless";
const HOSTED_SMS_PASSWORDLESS = "hosted_sms_passwordless";
const WEBAUTHN = "webauthn";

function initialize(){

}

// import Web3 from 'web3';
// import Torus from '@toruslabs/torus-embed';
// import { environment } from '../../environments/environment';

// const web3Obj = {
//   web3: new Web3(),
//   torus: new Torus({}),
//   setWeb3(provider) {
//     let web3Instance = new Web3(provider);
//     web3Obj.web3 = web3Instance;
//   },
//   async initialize() {
//     await web3Obj.torus.init({
//       showTorusButton: true,
//       buildEnv: 'production',
//       network: {
//         host: environment.torusHost,
//         chainId: environment.etherId
//       },
//       whiteLabel: {
//         theme: {
//           isDark: true,
//           colors: {
//             torusBrand1: '#FFD300',
//           },
//         },
//         logoDark: 'https://i.ibb.co/f2RZrKt/logo-web-512px.png', // dark logo for light background
//         logoLight: 'https://i.ibb.co/f2RZrKt/logo-web-512px.png',
//         customTranslations: {
//           en: {
//             embed: {
//               continue: 'Continue',
//               actionRequired: 'Confirm Action',
//               pendingAction: 'On the next screen, confirm your action by sending a transaction from your Bettery account', //...второй
//             },
//             dappTransfer: {
//               permission: 'Bettery',
//               data: 'Transaction Details',

//             },
//           },
//         },
//       },
//     });
//     web3Obj.torus.hideTorusButton();
//     await web3Obj.torus.login({});
//     web3Obj.setWeb3(web3Obj.torus.provider);
//   }
// };

// export default web3Obj;
