const LightWalletProvider = require('@digix/truffle-lightwallet-provider');

const { KEYSTORE, PASSWORD } = process.env;

if (!KEYSTORE || !PASSWORD) { throw new Error('You must export KEYSTORE and PASSWORD (see truffle.js)'); }

module.exports = {
  networks: {
    kovan: {
      provider: new LightWalletProvider({
        keystore: KEYSTORE,
        password: PASSWORD,
        rpcUrl: 'https://kovan.infura.io/',
        pollingInterval: 2000,
        // debug: true,
      }),
      gas: 6850000,
      gasPrice: 20 * 10 ** 9,
      network_id: '42',
    },
    mainnet: {
      provider: new LightWalletProvider({
        keystore: KEYSTORE,
        password: PASSWORD,
        rpcUrl: 'https://mainnet.infura.io/',
        pollingInterval: 5000,
        // debug: true,
      }),
      network_id: '1',
    },
    classic: {
      provider: new LightWalletProvider({
        keystore: KEYSTORE,
        password: PASSWORD,
        rpcUrl: 'https://digixparity04.digix.io/',
        pollingInterval: 5000,
        // debug: true,
      }),
      gas: 400000,
      network_id: '61',
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6700000,
    },
  },
  solc: {
    optimizer: {
      enabled: false,
    },
  },
  mocha: process.env.REPORT_GAS ? {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 21,
    },
  } : {},
};
