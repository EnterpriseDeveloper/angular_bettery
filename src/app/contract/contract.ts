import web3Obj from '../helpers/torus';
import Web3 from 'web3';
import BTYMain from '../../../build/contracts/BTYmain.json';
import networkConfiguration from '../config/network.json'
import configFile from '../config/config.json';
import configMaticMumbai from '../config/matic.json'; // TODO switch to prodaction
import PublicEventsJSON from '../../../build/contracts/PublicEvents.json';
import RootChainManagerProxyABI from '../../../build/contracts/RootChainManagerProxy.json';
import RootChainManager from '../../../build/contracts/RootChainManager.json';
import BTY from '../../../build/contracts/BTY.json';
import BET from '../../../build/contracts/BET.json';
var sigUtil = require('eth-sig-util')


export default class Contract {
    domainType;
    metaTransactionType;
    constructor() {
        this.domainType = [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ];

        this.metaTransactionType = [
            { name: "nonce", type: "uint256" },
            { name: "from", type: "address" },
            { name: "functionSignature", type: "bytes" },
        ];
    }

    async getBTYtokenMainChain(from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider)
        let abiTokenSale: any = BTYMain.abi
        return new web3.eth.Contract(abiTokenSale,
            BTYMain.networks[networkConfiguration.goerli].address)
    }

    async getBTYTokenContract() {
        let web3 = new Web3(window.biconomy);
        let abiBTY: any = BTY.abi;
        return new web3.eth.Contract(abiBTY, BTY.networks[networkConfiguration.maticMumbai].address);
    }

    async getBETTokenContract() {
        let web3 = new Web3(window.biconomy);
        let abiBET: any = BET.abi;
        return new web3.eth.Contract(abiBET, BET.networks[networkConfiguration.maticMumbai].address);
    }

    publicEventAddress() {
        return PublicEventsJSON.networks[networkConfiguration.maticMumbai].address;
    }

    erc20PredicateAddr() {
        return configMaticMumbai.Main.Contracts.ERC20Predicate;
    }

    rootChainManagerProxyAddr(){
        return configMaticMumbai.Main.POSContracts.RootChainManagerProxy;
    }

    rootChainManagerAddr(){
        return configMaticMumbai.Main.POSContracts.RootChainManager;
    }

    async approveBTYmainToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BTYMainContr = await this.getBTYtokenMainChain("torus"); // TODO switch if will use more that one wallet
        let functionSignature = await BTYMainContr.methods.approve(this.erc20PredicateAddr(), amount).encodeABI();
        let nonce = await BTYMainContr.methods.getNonce(userWallet).call();
        const tokenName = "BET_main";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BTYMain.networks[networkConfiguration.goerli].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYMainContr, functionSignature)
    }

    async deposit(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        const depositData = web3.eth.abi.encodeParameter('uint256', amount);
        const BTYMainAddr = BTYMain.networks[networkConfiguration.goerli].address;
        const abi: any = RootChainManager.abi;
        let rCMP = new web3.eth.Contract(abi, this.rootChainManagerProxyAddr());
        let functionSignature = await rCMP.methods.depositFor(userWallet, BTYMainAddr, amount).encodeABI();
        let nonce = await rCMP.methods.getNonce(userWallet).call();
        const tokenName = "RootChainManager";
        const chainId = 5; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, this.rootChainManagerProxyAddr(), nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, rCMP, functionSignature)
        
    }

    async approveBTYToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BTYToken = await this.getBTYTokenContract();
        let functionSignature = await BTYToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BTYToken.methods.getNonce(userWallet).call();
        const tokenName = "BTY_token";
        const chainId = 80001; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BTY.networks[networkConfiguration.maticMumbai].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BTYToken, functionSignature)
    }

    async approveBETToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BETToken = await this.getBETTokenContract();
        let functionSignature = await BETToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BETToken.methods.getNonce(userWallet).call();
        const tokenName = "BET_token";
        const chainId = 80001; // TODO switch to prodaction
        let dataToSign = this.dataToSignFunc(tokenName, BET.networks[networkConfiguration.maticMumbai].address, nonce, userWallet, functionSignature, chainId)
        return await this.setSignPromise(userWallet, dataToSign, web3, BETToken, functionSignature)
    }

    setSignPromise(userWallet, dataToSign, web3, whichContract, functionSignature) {
        return new Promise((resolve, reject) => {
            web3.eth.currentProvider.send(
                {
                    jsonrpc: "2.0",
                    id: 999999999999,
                    method: "eth_signTypedData_v4",
                    params: [userWallet, dataToSign],
                },
                async (error, response) => {
                    if (error) {
                        console.log(error)
                        return reject(error)
                    }

                    let { r, s, v } = this.getSignatureParameters(response.result, web3);

                    const recovered = sigUtil.recoverTypedSignature_v4({
                        data: JSON.parse(dataToSign),
                        sig: response.result,
                    });
                    console.log(`Recovered ${recovered}`);
                    let executeMetaTransaction = await whichContract.methods
                        .executeMetaTransaction(userWallet, functionSignature, r, s, v)
                        .send({
                            from: userWallet
                        });

                    return resolve(executeMetaTransaction);
                }
            );
        })
    }

    dataToSignFunc(tokenName, contractAddress, nonce, userWallet, functionSignature, chainId) {
        let domainData = {
            name: tokenName,
            version: "1",
            chainId: chainId, // TODO check chain id network
            verifyingContract: contractAddress,
        };

        let message: any = {};
        message.nonce = parseInt(nonce);
        message.from = userWallet;
        message.functionSignature = functionSignature;
        message.network = "Interact with Matic Network";

        return JSON.stringify({
            types: {
                EIP712Domain: this.domainType,
                MetaTransaction: this.metaTransactionType,
            },
            domain: domainData,
            primaryType: "MetaTransaction",
            message: message,
        });
    }


    getSignatureParameters(signature, web3) {
        if (!web3.utils.isHexStrict(signature)) {
            throw new Error(
                'Given value "'.concat(signature, '" is not a valid hex string.')
            );
        }
        var r = signature.slice(0, 66);
        var s = "0x".concat(signature.slice(66, 130));
        var v: any = "0x".concat(signature.slice(130, 132));
        v = web3.utils.hexToNumber(v);
        if (![27, 28].includes(v)) v += 27;
        return {
            r: r,
            s: s,
            v: v,
        };
    };

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
