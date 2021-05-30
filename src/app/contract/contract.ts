import MetaTransaction from './metaTransaction';
import web3Obj from '../helpers/torus';
import Web3 from 'web3';
import BTYMain from '../../../build/contracts/BTYmain.json';
import networkConfiguration from '../config/network.json'
import configFile from '../config/config.json';
import configMaticMumbai from '../config/matic.json'; // TODO switch to prodaction
import PublicEventsJSON from '../../../build/contracts/PublicEvents.json';
import RootChainManager from '../../../build/contracts/RootChainManager.json';
import BTY from '../../../build/contracts/BTY.json';
import BET from '../../../build/contracts/BET.json';
import { environment } from '../../environments/environment';

export default class Contract extends MetaTransaction {

    async getBTYtokenMainChain(network) {
        let web3 = new Web3(network);
        let abi: any = BTYMain.abi
        return new web3.eth.Contract(abi,
            BTYMain.networks[networkConfiguration.goerli].address) // TODO add prod network id
    }

    async getBTYTokenContract() {
        let web3 = new Web3(window.biconomy);
        let abiBTY: any = BTY.abi;
        return new web3.eth.Contract(abiBTY, BTY.networks[environment.maticId].address);
    }

    async getBETTokenContract() {
        let web3 = new Web3(window.biconomy);
        let abiBET: any = BET.abi;
        return new web3.eth.Contract(abiBET, BET.networks[environment.maticId].address);
    }

    publicEventAddress() {
        return PublicEventsJSON.networks[environment.maticId].address;
    }

    erc20PredicateAddr() {
        return configMaticMumbai.Main.POSContracts.ERC20PredicateProxy; // TODO add to prod
    }

    rootChainManagerProxyAddr() {
        return configMaticMumbai.Main.POSContracts.RootChainManagerProxy; // TODO add to prod
    }

    rootChainManagerAddr() {
        return configMaticMumbai.Main.POSContracts.RootChainManager; // TODO add to prod
    }

    async approveBTYmainToken(userWallet, amount, provider) {
        let web3 = new Web3(window.biconomy)
        let BTYMainContr = await this.getBTYtokenMainChain(provider); // TODO switch if will use more that one wallet
        let functionSignature = await BTYMainContr.methods.approve(this.erc20PredicateAddr(), amount).encodeABI();
        let nonce = await BTYMainContr.methods.getNonce(userWallet).call();
        const tokenName = "BET_main";
        const chainId = environment.etherId;
        let contractAddr = BTYMain.networks[networkConfiguration.goerli].address;
        let dataToSign = this.dataToSignFunc(tokenName, BTYMain.networks[networkConfiguration.goerli].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYMainContr, functionSignature, contractAddr, nonce, web3Obj.loginDetails.privateKey)
    }

    async deposit(userWallet, amount, from, provider) {
        console.log(provider)
        let web3 = new Web3(provider);
        let web3_2 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        const depositData = web3.eth.abi.encodeParameter('uint256', amount);
        console.log(depositData)
        const BTYMainAddr = BTYMain.networks[networkConfiguration.goerli].address;
        //const BTYMainAddr = "0xf1a5c13e3ED219F705cEf4B4f52492711eaaa08a";
        const abi: any = RootChainManager.abi;
        let rCMP = new web3.eth.Contract(abi, this.rootChainManagerProxyAddr());
        let functionSignature = await rCMP.methods.depositFor(userWallet, BTYMainAddr, depositData).encodeABI();
        let nonce = await rCMP.methods.getNonce(userWallet).call();
        console.log(nonce)
        const tokenName = "RootChainManager";
        const chainId = environment.etherId;
        let contractAddr = this.rootChainManagerProxyAddr();
        let dataToSign = this.dataToSignFunc(tokenName, contractAddr, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3_2, rCMP, functionSignature, contractAddr, nonce, web3Obj.loginDetails.privateKey)

    }

    async approveBTYToken(userWallet, amount) {
        let web3 = new Web3(window.biconomy)
        let BTYToken = await this.getBTYTokenContract();
        let functionSignature = await BTYToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BTYToken.methods.getNonce(userWallet).call();
        const tokenName = "BTY_token";
        const chainId = environment.etherId;
        let contractAddr = BTY.networks[environment.maticId].address;
        let dataToSign = this.dataToSignFunc(tokenName, contractAddr, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYToken, functionSignature, contractAddr, nonce, web3Obj.loginDetails.privateKey)
    }

    async approveBETToken(userWallet, amount) {
        let web3 = new Web3(window.biconomy)
        let BETToken = await this.getBETTokenContract();
        let functionSignature = await BETToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BETToken.methods.getNonce(userWallet).call();
        const tokenName = "BET_token";
        const chainId = environment.etherId;
        let contractAddr = BET.networks[environment.maticId].address;
        let dataToSign = this.dataToSignFunc(tokenName, contractAddr, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BETToken, functionSignature, contractAddr, nonce, web3Obj.loginDetails.privateKey)
    }

    async swipeTokens(userWallet, amount) {
        let web3 = new Web3(window.biconomy)
        let BTYToken = await this.getBTYTokenContract();
        let functionSignature = await BTYToken.methods.swipe(amount).encodeABI();
        let nonce = await BTYToken.methods.getNonce(userWallet).call();
        const tokenName = "BTY_token";
        const chainId = environment.etherId;
        let contractAddr = BTY.networks[environment.maticId].address;
        let dataToSign = this.dataToSignFunc(tokenName, contractAddr, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYToken, functionSignature, contractAddr, nonce, web3Obj.loginDetails.privateKey)
    }

    getUserAccount() {
        return web3Obj.loginDetails.publicAddress;
    }

}

// OLD CODE
    // async withdrawalWETHToken(userWallet, amount, from) {
    //     let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
    //     let WETHToken = await this.getWETHContract();
    //     let functionSignature = await WETHToken.methods.withdraw(amount).encodeABI();
    //     console.log(functionSignature)
    //     let nonce = await WETHToken.methods.getNonce(userWallet).call();
    //     const tokenName = await WETHToken.methods.name().call();
    //     let dataToSign = this.dataToSignFunc(tokenName, configFile.child.MaticWETH, nonce, userWallet, functionSignature)
    //     let burnTxHash = await this.setSignPromise(userWallet, dataToSign, web3, WETHToken, functionSignature);
    //     console.log(burnTxHash);
    //     let burnTx = burnTxHash.transactionHash;
    //     let getSing = await buildPayloadForExit(String(burnTx), from, web3);
    //     let rootContract = await this.RootChainManagerContract(from)
    //     let message = await rootContract.methods.exit(getSing).encodeABI();
    //     console.log(message)
    //     var signature = await web3.eth.personal.sign(message, userWallet);
    //     console.log(signature);
    //     return { withdrawal: burnTxHash, sign: signature }
    // }

    // async RootChainManagerContract(from) {
    //     let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider)
    //     let abi = RootChainManagerJSON.abi
    //     return new web3.eth.Contract(abi, "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74")
    // }
