import { Web3 } from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import ABI from "./abi.json";
import { ContractContext } from "./abi-types";

const PRIVATE_KEY = `${process.env.PRIVATE_KEY}`;
const NODE_URL = `${process.env.NODE_URL}`;
const CONTRACT_ADDRESS = `${process.env.CONTRACT_ADDRESS}`;
const WALLET = `${process.env.WALLET}`;

const localKeyProvider = new HDWalletProvider({
  privateKeys: [PRIVATE_KEY],
  providerOrUrl: NODE_URL,
});

const web3 = new Web3(localKeyProvider as any);

export async function minAndTransfer(to: string): Promise<string> {
  const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS, {
    from: WALLET,
  }) as unknown as ContractContext;

  const tx =  await contract.methods.mint(to).send()

  return tx.transactionHash;
}
