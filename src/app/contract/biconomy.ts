import { Biconomy } from "@biconomy/mexa";
import { environment } from '../../environments/environment';
import Web3 from 'web3';

const biconomyInit = async () => {
    console.log(environment.maticUrl)
    let biconomy = new Biconomy(new Web3.providers.WebsocketProvider(environment.maticUrl),
        {
            apiKey: environment.biconomy,
            strictMode: true
        });
    await BiconomyReady(biconomy);
    window.biconomy = biconomy;
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

export default biconomyInit;


