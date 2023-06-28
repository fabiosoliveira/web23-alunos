require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    bscscan: process.env.API_KEY,
  },
  networks: {
    bsctest: {
      provider: new HDWalletProvider({
        mnemonic: {
          phrase: process.env.SECRET,
        },
        providerOrUrl: process.env.NODE_URL,
      }),
      network_id: "97",
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
    },
  },
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
