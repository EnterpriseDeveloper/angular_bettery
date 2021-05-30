var sigUtil = require('eth-sig-util')

export default class MetaTransaction {
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

    async setSignPromise(userWallet, dataToSign, web3, whichContract, functionSignature, contractAddress, nonce, privateKey) {
        let x = Buffer.from(privateKey, 'hex');
        const signature = sigUtil.signTypedMessage(x, { data: dataToSign }, 'V3');
        let { r, s, v } = this.getSignatureParameters(signature, web3);
        let executeMetaTransactionData = whichContract.methods.executeMetaTransaction(userWallet, functionSignature, r, s, v).encodeABI();
        let gasEstimate = await whichContract.methods.executeMetaTransaction(userWallet, functionSignature, r, s, v).estimateGas({ from: userWallet });

        let txParams = {
            "from": userWallet,
            "to": contractAddress,
            "nonce": nonce,
            "value": "0x0",
            "gas": Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
            "data": executeMetaTransactionData
        };

        const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash) => {
            if (error) {
                console.log("ERROR HERE")
                return console.error(error);
            }
            console.log("Transaction hash is ", txHash);
            return txHash;
        });
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

        return {
            types: {
                EIP712Domain: this.domainType,
                MetaTransaction: this.metaTransactionType,
            },
            domain: domainData,
            primaryType: "MetaTransaction",
            message: message,
        };
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