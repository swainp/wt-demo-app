
module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 0x5B8D80, // 6000000 gas
      gasPrice: 21000000000 // 21 Gwei
    },
    testnet: {
      host: "https://morden.infura.io/WKNyJ0kClh8Ao5LdmO7z",
      network_id: "*",
      port: 8545,
      gasPrice: 21000000000 // 21 Gwei
    }
  },
  mocha: {
    // a commented out mocha option, shows how to pass mocha options
    // bail: true  // bail makes mocha to stop as soon as a test failure is found
  }
};
