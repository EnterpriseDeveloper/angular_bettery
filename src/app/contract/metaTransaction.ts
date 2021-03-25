var sigUtil = require('eth-sig-util')

export default class MetaTransaction{
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
            chainId: chainId,
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