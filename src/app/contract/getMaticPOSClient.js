import matic from '@maticnetwork/maticjs';
import config from '../config/config.json';
import Web3 from "web3";
import web3Obj from '../helpers/torus';

const getMaticPOSClient = async (whichProvider) => {

    let goerli = new Web3(whichProvider === "metamask" ? window.web3.currentProvider : web3Obj.torus.provider)
    let accounts = await goerli.eth.getAccounts();
    let MaticPOSClient = matic.MaticPOSClient;
    return new MaticPOSClient({
        network: 'testnet', 
        version: 'mumbai', 
        parentProvider: new Web3(whichProvider === "metamask" ? window.web3.currentProvider : web3Obj.torus.provider),
        maticProvider: new Web3(window.biconomy),
        posRootChainManager: config.root.RootChainManagerProxy,
        posERC20Predicate: config.root.ERC20PredicateProxy,
        parentDefaultOptions: { from: accounts[0] }, // optional, can also be sent as last param while sending tx
        maticDefaultOptions: { from: accounts[0] }, // optional, can also be sent as last param while sending tx
    })
}

export default getMaticPOSClient;