import Web3 from "web3";
import { AbiItem } from "web3-utils";
// import { Contract } from "web3-eth-contract";
import abi from "./abi.json";
import { ContractContext } from "./types-abi";

const ADAPTER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function getWeb3() {
  if (!window.ethereum) throw new Error("No MetaMask found");
  return new Web3(window.ethereum);
}

function getContract(web3?: Web3): ContractContext {
  if (!web3) {
    web3 = getWeb3();
  }

  return new web3.eth.Contract(abi as AbiItem[], ADAPTER_ADDRESS, {
    from: localStorage.getItem("account") || undefined,
  }) as unknown as ContractContext;
}

export async function doLogin() {
  const web3 = getWeb3();
  const accounts = await web3.eth.requestAccounts();

  if (!accounts || !accounts.length)
    throw new Error("Wallet not found/allowed.");

  const contract = getContract(web3);

  const ownerAddress = await contract.methods.owner().call();

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

export async function getDashboard(): Promise<Dashboard> {
  const contract = getContract();
  const address = await contract.methods.getAddress().call();

  if (/^(0x0+)$/.test(address)) {
    return {
      bid: Web3.utils.toWei("0.01", "ether"),
      commission: "10",
      address,
    };
  }

  const bid = await contract.methods.getBid().call();
  const commission = await contract.methods.getCommission().call();

  return { bid, commission, address };
}

export async function upgrade(newContract: string): Promise<string> {
  const contract = getContract();
  const tx = await contract.methods.upgrade(newContract).send();
  return tx.transactionHash;
}

export async function setCommission(newCommission: string): Promise<string> {
  const contract = getContract();
  const tx = await contract.methods.setCommission(newCommission).send();
  return tx.transactionHash;
}

export async function setBid(newBid: string): Promise<string> {
  const contract = getContract();
  const tx = await contract.methods.setBid(newBid).send();
  return tx.transactionHash;
}

export async function play(option: Options): Promise<string> {
  const contract = getContract();
  const bid = await contract.methods.getBid().call();
  const tx = await contract.methods.play(option).send({ value: bid });
  return tx.transactionHash;
}

export async function getResult() {
  const contract = getContract();
  return contract.methods.getResult().call();
}

export async function getLeaderboard(): Promise<Leaderboard> {
  const contract = getContract();
  const players = await contract.methods.getLeaderboard().call();
  const result = await contract.methods.getResult().call();
  return { players, result };
}

export async function getBestPlayers() {
  const contract = getContract();
  return contract.methods.getLeaderboard().call();
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function listenEvent(callback: Function) {
  const web3 = new Web3(import.meta.env.VITE_APP_WEBSOCKET_SERVER);
  const contract = getContract(web3);

  contract.events
    .Played({ fromBlock: "latest" })
    .on("data", (event) => callback(event.returnValues.result))
    .on("error", console.error);

  // contract.events
  //   .Played({ fromBlock: "latest", filter: { player: "0x0000000000000000000000000000000000000000" } })
  //   .on("data", (event) => callback(event.returnValues.result))
  //   .on("error", console.error);
}

export type Dashboard = {
  bid?: string;
  commission?: string;
  address?: string;
};

export type Leaderboard = {
  players?: any[];
  result?: string;
};

export enum Options {
  NONE = 0,
  ROCK = 1,
  PAPER = 2,
  SCISSORS = 3,
}
