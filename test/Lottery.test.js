const assert = require('assert');
// const { DH_UNABLE_TO_CHECK_GENERATOR } = require("constants");
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    // new web3.eth.Contract(JSON.parse(interface)).deploy({data: bytecode, arguments: ['Hi there!] })
    lottery = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode
        })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery', () => {
    // Run a test and make an assertion
    it('Deploys a contract', () => {
        // console.log(lottery);
        // assert.strictEqual(car.park(), "stopped");
        assert.ok(lottery.options.address);
    });

    it('Allows 1 account to enter', async () => {
        // Calls the "enter" method in the Lottery
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('Allows multiple accounts to enter', async () => {
        // Calls the "enter" method in the Lottery
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(accounts[1], players[1]);
        assert.strictEqual(accounts[2], players[2]);
        assert.strictEqual(3, players.length);
    });

    it('Requires a min amount of ether to enter', async () => {
        // Calls the "enter" method in the Lottery
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 200 // 200 WEI
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('Only the manager can call pickWinner', async () => {
        // Calls the "enter" method in the Lottery
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('Sends money to the winner and resets the players array', async () => {
        // Calls the "enter" method in the Lottery
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const diff = finalBalance - initialBalance;

        // console.log(diff);

        // Allows for some amout of gas spent (i.e., 2 eth)
        assert(diff > web3.utils.toWei('1.9', 'ether'));
    });
});
