import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";
import abi from "./abi.json";

const ADAPTER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function getWeb3() {
  if (!window.ethereum) throw new Error("No MetaMask found");
  return new Web3(window.ethereum);
}

function getContract(web3?: Web3): Contract {
  if (!web3) {
    web3 = getWeb3();
  }

  return new web3.eth.Contract(abi as AbiItem[], ADAPTER_ADDRESS, {
    from: localStorage.getItem("account") || undefined,
  });
}

export async function doLogin() {
  const web3 = getWeb3();
  const accounts = await web3.eth.requestAccounts();

  if (!accounts || !accounts.length)
    throw new Error("Wallet not found/allowed.");

  const contract = getContract(web3);
  console.log("contract", contract);

  const ownerAddress = await contract.methods.owner().call();
  console.log("ownerAddress", ownerAddress);

  localStorage.setItem("account", accounts[0]);
  localStorage.setItem("isAdmin", `${accounts[0] === ownerAddress}`);

  return {
    accounts: accounts[0],
    isAdmin: accounts[0] === ownerAddress,
  };
}

export function doLogout() {
  localStorage.removeItem("account");
  localStorage.removeItem("isAdmin");
}
