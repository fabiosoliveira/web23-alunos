require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    // etherscan: process.env.API_KEY_ETH,
    bscscan: process.env.API_KEY_BSC,
  },
  networks: {
    bsctest: {
      provider: new HDWalletProvider({
        mnemonic: {
          phrase: process.env.SECRET,
        },
        providerOrUrl: process.env.BSC_URL,
      }),
      network_id: "97",
    },
    goerli: {
      provider: new HDWalletProvider({
        mnemonic: {
          phrase: process.env.SECRET,
        },
        providerOrUrl: process.env.INFURA_URL,
      }),
      network_id: "5",
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
          enabled: true, // Default: false
          runs: 200, // Default: 200
        },
      },
    },
  },
};
