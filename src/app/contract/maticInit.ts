import Web3 from "web3";
import web3Obj from '../helpers/torus'
import Contract from "./contract";

export default class maticInit {
    whichProvider;

    constructor(provider) {
        this.whichProvider = provider;
    }

    async getUserAccount() {
        let goerli = new Web3(this.whichProvider === "metamask" ? window.web3.currentProvider : web3Obj.torus.provider)
        let accounts = await goerli.eth.getAccounts();
        return accounts[0];
    }

    async getBTYTokenBalance() {
        let from = await this.getUserAccount();
        let contr = new Contract();
        let contract = await contr.getBTYTokenContract();
        return await contract.methods.balanceOf(from).call();
    }

    async getBETTokenBalance() {
        let from = await this.getUserAccount();
        let contr = new Contract();
        let tokenContract = await contr.getBETTokenContract();
        return await tokenContract.methods.balanceOf(from).call();
    }

    async getBTYTokenOnMainChainBalance() {
        let from = await this.getUserAccount();
        let contr = new Contract();
        let network = new Web3(this.whichProvider === "metamask" ? window.web3.currentProvider : web3Obj.torus.provider)
        let tokenContract = await contr.getBTYtokenMainChain(network);
        return await tokenContract.methods.balanceOf(from).call();
    }
}
