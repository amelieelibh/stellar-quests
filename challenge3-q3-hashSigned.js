const { Server, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Asset } = require('stellar-sdk');
const { find } = require('lodash');
const BigNumber = require('bignumber.js');
var crypto = require('crypto');

const runFunction = async () => {
    try {
        const server = new Server('https://horizon-testnet.stellar.org')

        const myKeypair = Keypair.fromSecret('SAGGXYNSTISRKRB2XA4TKGZK26MYAZMOLUDTYGD5TW6WQPYNCMCDR6GA');
        const myPublicKey = myKeypair.publicKey();

        const account = await server.loadAccount(myPublicKey);

        var hash = crypto.createHash('sha256');
        const preimage = 'S2FuYXllTmV0';
        hash.update(preimage);
        // var memoHashHex = Buffer.from(preimage, 'hex');
        var memoHashHex = hash.digest('hex');
        console.log(memoHashHex);

        var transactionBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE * 2,
            networkPassphrase: Networks.TESTNET
        });

        transactionBuilder = transactionBuilder.addOperation(Operation.setOptions({
            signer: {
                sha256Hash: memoHashHex,
                weight: 1
            },
            source: myPublicKey
        }));

        const tx = transactionBuilder
            .setTimeout(1000).build();

        tx.sign(myKeypair);

        console.log('Sending signer');
        await server.submitTransaction(tx);
        console.log('Sent signer');


        transactionBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE * 2,
            networkPassphrase: Networks.TESTNET
        });

        transactionBuilder = transactionBuilder.addOperation(Operation.setOptions({
            signer: {
                sha256Hash: memoHashHex,
                weight: 2
            },
            source: myPublicKey
        }));

        const tx2 = transactionBuilder
            .setTimeout(1000).build();

        // tx2.sign(myKeypair);
        tx2.signHashX(toHex(preimage));
        // tx2.signHashX(memoHashHex);

        console.log('removing signer');
        const res = await server.submitTransaction(tx2);
        console.log('removing signer', res);

    } catch (err) {
        // console.error("Error while executing function ", err);
        console.error("Error while executing function ", err?.response?.data);
    }
};
function toHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}

runFunction();
