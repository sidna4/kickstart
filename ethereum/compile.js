const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');

fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

// const output = solc.compile(source, 1).contracts;
// console.log('Source: ', source);
// console.log('Output: ', output);

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

// console.log('Source: ', source);
// console.log('Input: ', input);

var json = JSON.stringify(input);

// console.log('Json: ', json);

var compile = solc.compile(json);

if (compile.errors) {
    compile.errors.forEach((err) => {
        console.log(err);
    });
} else {
    // console.log('Compile: ', compile);

    var output = JSON.parse(compile);

    // console.log('Output: ', output);

    // console.log('Source: ', source, '\n', 'Output: ', output);

    fs.ensureDirSync(buildPath);

    const contracts = output.contracts['Campaign.sol'];

    for (let contractName in contracts) {
        // console.log('Contract Name: ', contractName);
        const contract = contracts[contractName];

        // console.log('JSON: ', JSON.stringify(contract, null, 2));

        fs.outputJsonSync(
            path.resolve(buildPath, contractName + '.json'),
            contract,
            'utf8'
        );

        // fs.writeFileSync(
        //     path.resolve(buildPath, `${contract}.json`),
        //     JSON.stringify(contract.abi, null, 2),
        //     'utf8'
        // );
    }
}
// ABI - Application Binary Interface
// bytecode - The contract
// exports.abi = output.contracts['Campaign.sol']['Campaign'].abi;
// exports.bytecode =
//     output.contracts['Campaign.sol']['Campaign'].evm.bytecode.object;
