import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgCreateSwipeBet } from "./funds/tx"; 
import {MsgCreateValidPubEvents, MsgCreateCreatePubEvents, MsgCreatePartPubEvents} from './pubEvents/tx'
import {MsgCreateValidPrivEvents, MsgCreatePartPrivEvents, MsgCreateCreatePrivEvents} from './privEvents/tx'
import authHelp from '../helpers/auth-help'
import { environment } from "../../environments/environment";


const types = [
    ["/VoroshilovMax.bettery.funds.MsgCreateSwipeBet", MsgCreateSwipeBet],
    ["/VoroshilovMax.bettery.publicevents.MsgCreateValidPubEvents", MsgCreateValidPubEvents],
    ["/VoroshilovMax.bettery.publicevents.MsgCreateCreatePubEvents", MsgCreateCreatePubEvents],
    ["/VoroshilovMax.bettery.publicevents.MsgCreatePartPubEvents", MsgCreatePartPubEvents],
    ["/VoroshilovMax.bettery.privateevents.MsgCreateValidPrivEvents", MsgCreateValidPrivEvents],
    ["/VoroshilovMax.bettery.privateevents.MsgCreatePartPrivEvents", MsgCreatePartPrivEvents],
    ["/VoroshilovMax.bettery.privateevents.MsgCreateCreatePrivEvents", MsgCreateCreatePrivEvents],
  ];

const registry = new Registry(<any>types);


const connectToSign = async () => {
    let memonic = authHelp.walletUser.mnemonic
    if(memonic){
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
            memonic
        );
    
        let addr = environment.demon;
        const [{ address }] = await wallet.getAccounts();
        const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
        return { memonic, address, client }
    }else{
        console.log("error getting memonic")
    }
    
}

export {
    connectToSign
}