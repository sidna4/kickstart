const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');

fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

var input = {
    language: 'Solidity',
    sources: {
        'Campaign.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

var json = JSON.stringify(input);

var compile = solc.compile(json);

if (compile.errors) {
    compile.errors.forEach((err) => {
        console.log(err);
    });
} else {
    var output = JSON.parse(compile);

    fs.ensureDirSync(buildPath);

    const contracts = output.contracts['Campaign.sol'];

    for (let contractName in contracts) {
        const contract = contracts[contractName];

        fs.outputJsonSync(
            path.resolve(buildPath, contractName + '.json'),
            contract,
            'utf8'
        );
    }
}
