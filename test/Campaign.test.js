const assert = require('assert');
// const { DH_UNABLE_TO_CHECK_GENERATOR } = require("constants");
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

// const { abi, bytecode } = require('../ethereum/compile');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '2000000' });

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(
        compiledCampaign.abi,
        campaignAddress
    );
});

describe('Campaigns', () => {
    // Run a test and make an assertion
    it('Deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('Marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();

        assert.strictEqual(accounts[0], manager);
    });

    it('Allows people to contribute money and marks as approver', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });

        const isContributor = await campaign.methods
            .approvers(accounts[1])
            .call();

        assert(isContributor);
    });

    it('Requires a min contribution', async () => {
        try {
            await campaign.methods
                .contribute()
                .send({ value: 5, from: accounts[1] });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('Allows a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Buy Batteries', 100, accounts[1])
            .send({ from: accounts[0], gas: '1000000' });

        const request = await campaign.methods.requests(0).call();

        assert.strictEqual('Buy Batteries', request.description);
    });

    it('Processess requests', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods
            .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({ from: accounts[0], gas: '1000000' });

        await campaign.methods
            .approveRequest(0)
            .send({ from: accounts[1], gas: '1000000' });

        await campaign.methods
            .finalizeRequest(0)
            .send({ from: accounts[0], gas: '1000000' });

        let balance = await web3.eth.getBalance(accounts[1]);

        balance = web3.utils.fromWei(balance, 'ether');

        balance = parseFloat(balance);

        assert(balance > 94);
    });
});
