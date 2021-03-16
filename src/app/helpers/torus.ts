import Web3 from 'web3';
import Torus from '@toruslabs/torus-embed';

const web3Obj = {
  web3: new Web3(),
  torus: new Torus({}),
  setWeb3(provider) {
    let web3Instance = new Web3(provider);
    web3Obj.web3 = web3Instance;
  },
  async initialize() {
    await web3Obj.torus.init({
      showTorusButton: true,
      buildEnv: 'production',
      network: {
        host: 'goerli',
        chainId: 5
      },
      whiteLabel: {
        theme: {
          isDark: true,
          colors: {
            torusBrand1: '#FFD300',
          },
        },
        logoDark: 'https://matic-network.d2f172wsk4mtv2.amplifyapp.com/bettery6.f2c637f980b2224fc627.png', // dark logo for light background
        logoLight: 'https://matic-network.d2f172wsk4mtv2.amplifyapp.com/bettery6.f2c637f980b2224fc627.png',
        customTranslations: {
          en: {
            embed: {
              continue: 'Continue',
              actionRequired: 'Confirm Action',
              pendingAction: 'On the next screen, confirm your action by sending a transaction from your Bettery account', //...второй
            },
            dappTransfer: {
              permission: 'Bettery',
              data: 'Transaction Details',

            },
          },
        },
      },
    });
    web3Obj.torus.hideTorusButton();
    await web3Obj.torus.login({});
    web3Obj.setWeb3(web3Obj.torus.provider);
  }
};

export default web3Obj;
