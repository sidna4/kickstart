const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const compiledFactory = require('../ethereum/build/CampaignFactory.json');

console.log('XX');

const abi = compiledFactory.abi;
const bytecode = compiledFactory.evm.bytecode.object;

const provider = new HDWalletProvider(
    // Your mnemonic
    'violin foster nose rather era era donor intact yellow donate squeeze donor',
    // "https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q"
    'https://rinkeby.infura.io/v3/0b5757031f9f4a528330714562b364ae'
);

const web3 = new Web3(provider);

// Await cannot be called outside of a function
// We are using this function only to use the async/await syntax
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode })
        .send({
            gas: '2000000',
            from: accounts[0]
        });

    console.log('contract deployed to', result.options.address);
};

deploy();
