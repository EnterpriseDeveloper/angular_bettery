import Web3 from "web3";
import web3Obj from '../helpers/torus'
import Contract from "./contract";

export default class maticInit {
    whichProvider;

    constructor(provider) {
        this.whichProvider = provider;
    }

    getUserAccount() {
        return web3Obj.loginDetails.publicAddress;
    }

    async getBTYTokenBalance() {
        let from = this.getUserAccount();
        let contr = new Contract();
        let contract = await contr.getBTYTokenContract();
        return await contract.methods.balanceOf(from).call();
    }

    async getBETTokenBalance() {
        let from = this.getUserAccount();
        let contr = new Contract();
        let tokenContract = await contr.getBETTokenContract();
        return await tokenContract.methods.balanceOf(from).call();
    }

    async getBTYTokenOnMainChainBalance() {
        let from = this.getUserAccount();
        let contr = new Contract();
        let network = new Web3(this.whichProvider === "metamask" ? window.web3.currentProvider : web3Obj.torus.currentProvider)
        let tokenContract = await contr.getBTYtokenMainChain(network);
        return await tokenContract.methods.balanceOf(from).call();
    }
}
