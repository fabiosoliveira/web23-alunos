import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ABI from "./abi.json";
import { ContractContext } from "./abi";

const CONTRACT_ADDRESS = `${import.meta.env.VITE_APP_CONTRACT_ADDRESS}`;

export async function mint() {
  if (!window.ethereum) throw new Error("No MetaMask found!");
  const web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.requestAccounts();
  if (!accounts || !accounts.length) throw new Error("No accounts allowed!");

  const contract = new web3.eth.Contract(ABI as AbiItem[], CONTRACT_ADDRESS, {
    from: accounts[0],
  }) as unknown as ContractContext;

  const tx = await contract.methods.mint().send({ from: accounts[0] });

  console.log(tx.transactionHash);

  return tx.transactionHash;
}
