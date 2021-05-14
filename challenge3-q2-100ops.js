const { Server, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Asset } = require('stellar-sdk');
const { find } = require('lodash');
const BigNumber = require('bignumber.js');

const runFunction = async () => {
    try {
        const server = new Server('https://horizon-testnet.stellar.org')

        const myKeypair = Keypair.fromSecret('SCS47NKWU5HLHAFHMFKQCQZYMM2ZYDXGJTBCHBZMGVCSAWAGZ3DH72WH');
        const myPublicKey = myKeypair.publicKey();

        const destKeypair = Keypair.fromPublicKey('GCSTUGKFP5ABZU5TFF2HT7YQHX3TEVTYIZUVS3W2LK5OML5JO6REY4MP');
        const destPK = destKeypair.publicKey();

        const account = await server.loadAccount(myPublicKey);

        var transactionBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE * 2,
            networkPassphrase: Networks.TESTNET
        });
        for (var index = 0; index < 100; index++) {
            console.log("adding op: ", index);
            transactionBuilder = transactionBuilder.addOperation(Operation.payment({
                asset: Asset.native(),
                amount: '0.001',
                destination: destPK,
                source: myPublicKey
            }));
        }

        const transaction = transactionBuilder
            .setTimeout(1000)
            .build();

        transaction.sign(myKeypair);

        console.log('Sending 100 ops');
        await server.submitTransaction(transaction);
        console.log('100 payments submited');
    } catch (err) {
        console.error("Error while executing function ", err);
    }
};

runFunction();
