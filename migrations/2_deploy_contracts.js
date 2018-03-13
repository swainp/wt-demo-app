const contract = require("truffle-contract");
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:8545");

// dirty hack for web3@1.0.0 support for localhost testrpc, see
// https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
function hackInSendAsync (instance) {
  if (typeof instance.currentProvider.sendAsync !== "function") {
    instance.currentProvider.sendAsync = function() {
      return instance.currentProvider.send.apply(
        instance.currentProvider, arguments
      );
    };
  }
  return instance;
}

const LifTokenTestData = require("@windingtree/lif-token/build/contracts/LifTokenTest");
var LifTokenTest = contract(LifTokenTestData);
LifTokenTest.setProvider(provider);
LifTokenTest = hackInSendAsync(LifTokenTest);

const WTIndexData = require("@windingtree/wt-contracts/build/contracts/WTIndex");
var WTIndex = contract(WTIndexData);
WTIndex.setProvider(provider);
WTIndex = hackInSendAsync(WTIndex);

module.exports = function(deployer, network, accounts) {
  if (network === 'development') {
    // First, we need the token contract with a faucet
    return deployer.deploy(LifTokenTest, {from: accounts[0], gas: 60000000}).then(function () {
      // And then we setup the WTIndex
      deployer.deploy(WTIndex, {from: accounts[0], gas: 60000000}).then(function () {
        let deployedIndex = WTIndex.at(WTIndex.address);
        deployedIndex.setLifToken(LifTokenTest.address, {from: accounts[0], gas: 60000000}).then(function () {
          console.log("========================================");
          console.log("    Index and token owner:", accounts[0]);
          console.log("    Wallet account:", accounts[1]);
          console.log("    LifToken with faucet:", LifTokenTest.address);
          console.log("    WTIndex:", WTIndex.address);
          return true;
        });
      });
    });
  }
};
