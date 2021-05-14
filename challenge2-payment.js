const { Server, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Asset } = require('stellar-sdk');
const { find } = require('lodash');
const BigNumber = require('bignumber.js');

const runFunction = async () => {
    try {
        const server = new Server('https://horizon-testnet.stellar.org')

        const myKeypair = Keypair.fromSecret('SCZF4SJBA2Y2ICLHA7JXEHTBJHLRE5QOULF2X5N34JYGPY4WH5RLHTPY');
        const myPublicKey = myKeypair.publicKey();

        const account = await server.loadAccount(myPublicKey);
        if (find(
            account.balances,
            (asset) => asset.asset_type !== 'native' && new BigNumber(asset.balance).gt(0)
        )) return console.log('Account has already accepted and received a custom asset')

        console.log('Account exists and is ready to receive custom asset')

        const issuerKeypair = Keypair.random()
        const issuerPublicKey = issuerKeypair.publicKey()

        await server
            .friendbot(issuerPublicKey)
            .call()
            .then(() => console.log('Random issuer account was successfully funded'))

        const SAUCYNUG = new Asset('SAUCYNUG', issuerPublicKey)

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
            .addOperation(Operation.changeTrust({
                asset: SAUCYNUG,
                limit: '100'
            }))
            .addOperation(Operation.payment({
                asset: SAUCYNUG,
                amount: '100',
                destination: myPublicKey,
                source: issuerPublicKey
            }))
            .setTimeout(0)
            .build()

        transaction.sign(myKeypair, issuerKeypair)

        console.log('Custom asset transaction has been prepared and signed')
        await server.submitTransaction(transaction)
        console.log('Custom asset transaction was successfully submitted')
    } catch (err) {
        console.error("Error whil executing function ", err);
    }
};

runFunction();
