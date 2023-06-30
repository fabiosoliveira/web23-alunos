import Web3 from "web3";
import { AbiItem } from "web3-utils";
import abi from "./abi.json";

export async function doLogin() {
  if (!window.ethereum) throw new Error("No MetaMask found");

  const web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.requestAccounts();

  if (!accounts || !accounts.length)
    throw new Error("Wallet not found/allowed.");

  const contract = new web3.eth.Contract(
    abi as AbiItem[],
    import.meta.env.VITE_CONTRACT_ADDRESS,
    { from: accounts[0] }
  );
  const ownerAddress = await contract.methods.owner().call();

  localStorage.setItem("account", accounts[0]);
  localStorage.setItem("isAdmin", `${accounts[0] === ownerAddress}`);

  return {
    accounts: accounts[0],
    isAdmin: accounts[0] === ownerAddress,
  };
}
