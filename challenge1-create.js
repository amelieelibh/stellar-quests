const { Server, Keypair, TransactionBuilder, BASE_FEE, Networks, Operation, Memo, MemoHash } = require('stellar-sdk')
const shajs = require('sha.js')
const parseError = require('@runkit/tyvdh/parse-error/2.0.0')

try {
    const memoHash = shajs('sha256').update('Stellar Quest Series 2').digest()
    const server = new Server('https://horizon-testnet.stellar.org')
    const myPublicKey = 'GD5QNPQDYPM2CMJSHIPNFEWVZP7ZQ6GVQWHOFWST5KFEIU5A652YHNIM'
    
    try {
        await server.loadAccount(myPublicKey)
        console.log('Your account has already been successfully created!')
    }
    
    catch(err) {
        const friendbotKeypair = Keypair.random()
        const friendbotPublicKey = friendbotKeypair.publicKey()

        await server
        .friendbot(friendbotPublicKey)
        .call()
        .then(() => {
            console.log('Random friendbot account was successfully funded')
            return server.loadAccount(friendbotPublicKey)
        })
        .then((account) => {
            const transaction = new TransactionBuilder(account, {
                fee: BASE_FEE,
                networkPassphrase: Networks.TESTNET,
                memo: new Memo(MemoHash, memoHash)
            })
            .addOperation(Operation.createAccount({
                destination: myPublicKey,
                startingBalance: '5000'
            }))
            .setTimeout(0)
            .build()

            transaction.sign(friendbotKeypair)

            console.log('Create account transaction has been prepared and signed')
            return server.submitTransaction(transaction)
        })
        .then(() => {
            console.log('Create account transaction was successfully submitted')
            return server.loadAccount(myPublicKey)
        })
        .then(() => console.log('Your account has been successfully created!'))
    }
}

catch(err) {
    console.error(parseError(err))
}