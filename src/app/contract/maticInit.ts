import Web3 from "web3";
import web3Obj from '../helpers/torus'
import ERC20 from '../../../build/contracts/EthERC20Coin.json';
import networkConfiguration from '../config/network.json';
import Contract from "./contract";


export default class maticInit {
    whichProvider;
    Ropsten_Erc20Address;

    constructor(provider) {
        this.whichProvider = provider;
        this.Ropsten_Erc20Address = ERC20.networks[networkConfiguration.goerli].address;
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
        let tokenContract = await contr.getBTYtokenMainChain("torus");
        return await tokenContract.methods.balanceOf(from).call();
    }

    // OLD CODE
    // async depositEth(amount) {
    //     let from = await this.getUserAccount();
    //     try {
    //         let maticPOS = await getMaticPOSClient(this.whichProvider);
    //         return await maticPOS.depositEtherForUser(from, amount, { from, gasPrice: '10000000000' })
    //     } catch (e) {
    //         return e
    //     }
    // }

    // async depositERC20Token(amount) {
    //     let from = await this.getUserAccount();
    //     try {
    //         let maticPOSClient = await getMaticPOSClient(this.whichProvider);
    //         let approve = await maticPOSClient.approveERC20ForDeposit(this.Ropsten_Erc20Address, amount, { from })
    //         console.log(approve);
    //         return await maticPOSClient.depositERC20ForUser(this.Ropsten_Erc20Address, from, amount, { from, gasPrice: '10000000000' })
    //     } catch (e) {
    //         return e
    //     }
    // }
}
