const { Server, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Asset, Account } = require('stellar-sdk');

const runFunction = async () => {
    try {
        const server = new Server('https://horizon-testnet.stellar.org');

        const myKeypair = Keypair.fromSecret('SBM2XSOTRJ5B2ZWBO4OUE4PBNMQHQJKMU4PCLT6QC6JFSIUWXQGP3GZ7');
        const myPublicKey = myKeypair.publicKey();

        const account = await server.loadAccount(myPublicKey);

        const sequenceNumber = account.sequenceNumber();
        console.log("sequenceNumber", sequenceNumber);

        const tx1 = new TransactionBuilder(new Account(myPublicKey, `${Number(sequenceNumber) + 1}`), {
            fee: BASE_FEE * 2,
            networkPassphrase: Networks.TESTNET,
        }).addOperation(Operation.payment({
            amount: '100',
            asset: Asset.native(),
            destination: 'GAG27KIO4QD6MDYAJ7ZJOBG7UF24ZBTRLC7NNPTMV3HUAE77P5TX5SHW',
            source: myPublicKey
        })).setTimeout(1000).build();

        const tx2 = new TransactionBuilder(account, {
            fee: BASE_FEE * 2,
            networkPassphrase: Networks.TESTNET
        }).addOperation(Operation.setOptions({
            signer: {
                preAuthTx: tx1.hash(),
                weight: 1
            },
            source: myPublicKey
        })).setTimeout(1000).build();

        tx2.sign(myKeypair);

        console.log('Sending signer');
        await server.submitTransaction(tx2);
        console.log('Sent signer ', tx2.sequence);


        console.log('submiting t1', tx1.sequence);
        const res = await server.submitTransaction(tx1);
        console.log('submitted t1', res);

    } catch (err) {
        console.error("Error while executing function ", err);
        // console.error("Error while executing function ", err?.response?.data);
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
