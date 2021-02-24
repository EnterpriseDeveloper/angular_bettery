import web3Obj from '../helpers/torus';
import Web3 from 'web3';
import BetteryToken from '../../../build/contracts/BetteryToken.json'
import TokenJSON from '../../../build/contracts/EthERC20Coin.json';
import networkConfiguration from '../config/network.json'
import configFile from '../config/config.json';
import MaticWETH from '../config/abi/MaticWETH.json'
import PublicEventJSON from '../../../build/contracts/PublicEvent.json';
import PrivateEventJSON from '../../../build/contracts/PrivateEvent.json';
var sigUtil = require('eth-sig-util')
import buildPayloadForExit from './withdrawal';
import RootChainManagerJSON from '../config/abi/RootChainManager.json'


export default class Contract {
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

    async RootChainManagerContract(from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider)
        let abi = RootChainManagerJSON.abi
        return new web3.eth.Contract(abi, "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74")
    }

    async tokenContractMainETH(from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider)
        let abiTokenSale = TokenJSON.abi
        return new web3.eth.Contract(abiTokenSale,
            TokenJSON.networks[networkConfiguration.goerli].address)
    }

    async getWETHContract() {
        let web3 = new Web3(window.biconomy);
        return new web3.eth.Contract(MaticWETH.abi, configFile.child.MaticWETH);
    }

    async getERC20ContractOnMaticChain() {
        let web3 = new Web3(window.biconomy);
        return new web3.eth.Contract(BetteryToken.abi, BetteryToken.networks[networkConfiguration.maticMumbai].address);
    }

    // PrivateEvent

    async privateEventContract() {
        let web3 = new Web3(window.biconomy);
        return new web3.eth.Contract(PrivateEventJSON.abi,
            this.privateEventAddress());
    }

    privateEventAddress() {
        return PrivateEventJSON.networks[networkConfiguration.maticMumbai].address;
    }

    async participateOnPrivateEvent(id, answer, userWallet, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let privateEvent = await this.privateEventContract()
        let functionSignature = await privateEvent.methods.setAnswer(id, answer).encodeABI();
        let nonce = await privateEvent.methods.getNonce(userWallet).call();
        let tokenName = "Private_contract";
        let betteryAddress = this.privateEventAddress()
        let dataToSign = this.dataToSignFunc(tokenName, betteryAddress, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, privateEvent, functionSignature)
    }

    async validateOnPrivateEvent(id, answer, userWallet, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let privateEvent = await this.privateEventContract()
        let functionSignature = await privateEvent.methods.setCorrectAnswer(id, answer).encodeABI();
        let nonce = await privateEvent.methods.getNonce(userWallet).call();
        let tokenName = "Private_contract";
        let betteryAddress = this.privateEventAddress()
        let dataToSign = this.dataToSignFunc(tokenName, betteryAddress, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, privateEvent, functionSignature)
    }

    // PublicEvent


    async publicEventContract() {
        let web3 = new Web3(window.biconomy);
        return new web3.eth.Contract(PublicEventJSON.abi,
            this.publicEventAddress())
    }

    publicEventAddress() {
        return PublicEventJSON.networks[networkConfiguration.maticMumbai].address;
    }

    async createPublicEvent(id, startTime, endTime, percentHost, percentValidator, questionQuantity, validatorsAmount, path, payEther, validatorsQuantityWay, userWallet, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let bettery = await this.publicEventContract()
        let functionSignature = await bettery.methods.startQestion(
            id,
            startTime,
            endTime,
            percentHost,
            percentValidator,
            questionQuantity,
            validatorsAmount,
            path,
            payEther,
            validatorsQuantityWay
        ).encodeABI();
        let nonce = await bettery.methods.getNonce(userWallet).call();
        let tokenName = "Public_contract";
        let betteryAddress = this.publicEventAddress()
        let dataToSign = this.dataToSignFunc(tokenName, betteryAddress, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, bettery, functionSignature)
    }

    async participateOnPublicEvent(id, answer, amount, userWallet, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let bettery = await this.publicEventContract()
        let functionSignature = await bettery.methods.setAnswer(id, answer, amount).encodeABI();
        let nonce = await bettery.methods.getNonce(userWallet).call();
        let tokenName = "Public_contract";
        let betteryAddress = this.publicEventAddress()
        let dataToSign = this.dataToSignFunc(tokenName, betteryAddress, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, bettery, functionSignature)
    }

    async validateOnPublicEvent(id, answer, userWallet, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let bettery = await this.publicEventContract()
        let functionSignature = await bettery.methods.setValidator(id, answer).encodeABI();
        let nonce = await bettery.methods.getNonce(userWallet).call();
        let tokenName = "Public_contract";
        let betteryAddress = this.publicEventAddress()
        let dataToSign = this.dataToSignFunc(tokenName, betteryAddress, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, bettery, functionSignature)
    }


    async approveWETHToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let WETHToken = await this.getWETHContract();
        let functionSignature = await WETHToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await WETHToken.methods.getNonce(userWallet).call();
        const tokenName = await WETHToken.methods.name().call();
        let dataToSign = this.dataToSignFunc(tokenName, configFile.child.MaticWETH, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, WETHToken, functionSignature)
    }

    async approveBETToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let BETToken = await this.getERC20ContractOnMaticChain();
        let functionSignature = await BETToken.methods.approve(this.publicEventAddress(), amount).encodeABI();
        let nonce = await BETToken.methods.getNonce(userWallet).call();
        const tokenName = await BETToken.methods.name().call();
        let dataToSign = this.dataToSignFunc(tokenName, BetteryToken.networks[networkConfiguration.maticMumbai].address, nonce, userWallet, functionSignature)
        return await this.setSignPromise(userWallet, dataToSign, web3, BETToken, functionSignature)
    }

    async withdrawalWETHToken(userWallet, amount, from) {
        let web3 = new Web3(from === "metamask" ? window.web3.currentProvider : web3Obj.web3.currentProvider);
        let WETHToken = await this.getWETHContract();
        let functionSignature = await WETHToken.methods.withdraw(amount).encodeABI();
        console.log(functionSignature)
        let nonce = await WETHToken.methods.getNonce(userWallet).call();
        const tokenName = await WETHToken.methods.name().call();
        let dataToSign = this.dataToSignFunc(tokenName, configFile.child.MaticWETH, nonce, userWallet, functionSignature)
        let burnTxHash = await this.setSignPromise(userWallet, dataToSign, web3, WETHToken, functionSignature);
        console.log(burnTxHash);
        let burnTx = burnTxHash.transactionHash;
        let getSing = await buildPayloadForExit(String(burnTx), from, web3);
        let rootContract = await this.RootChainManagerContract(from)
        let message = await rootContract.methods.exit(getSing).encodeABI();
        console.log(message)
        var signature = await web3.eth.personal.sign(message, userWallet);
        console.log(signature);
        return { withdrawal: burnTxHash, sign: signature }
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

    dataToSignFunc(tokenName, contractAddress, nonce, userWallet, functionSignature) {
        let domainData = {
            name: tokenName,
            version: "1",
            chainId: 5,
            verifyingContract: contractAddress,
        };

        let message = {};
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
        var v = "0x".concat(signature.slice(130, 132));
        v = web3.utils.hexToNumber(v);
        if (![27, 28].includes(v)) v += 27;
        return {
            r: r,
            s: s,
            v: v,
        };
    };

} 
