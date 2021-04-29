import { Biconomy } from "@biconomy/mexa";
import web3Obj from '../helpers/torus'
import Web3 from 'web3';

const biconomyMainInit = async () => {
    // TODO add provider for prodaction
    let biconomy = new Biconomy(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/2b5ec85db4a74c8d8ed304ff2398690d")
        // "wss://goerli.infura.io/ws/v3/2b5ec85db4a74c8d8ed304ff2398690d"
        //web3Obj.web3.currentProvider
        ,
        {
            apiKey: "fFSHzs4c0.4922e9d7-3091-49c7-b74b-520f368a5d82",
            //    strictMode: true,
            debug: true
        });
    await BiconomyReady(biconomy);
    return biconomy;
}

async function BiconomyReady(biconomy) {
    return new Promise<void>((resolve, reject) => {
        return biconomy
            .onEvent(biconomy.READY, async () => {
                resolve()
            })
            .onEvent(biconomy.ERROR, (error, message) => {
                reject(error);
            });
    });
}

export default biconomyMainInit;
