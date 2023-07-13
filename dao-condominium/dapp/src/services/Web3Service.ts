import { ethers } from "ethers";
import ABI from "./ABI.json";
import { ContractContext, TypesAbi } from "./types-abi";

const ADAPTER_ADDRESS = import.meta.env.VITE_APP_ADAPTER_ADDRESS as string;

export enum Profiler {
  RESIDENT = "RESIDENT",
  COUNSELOR = "COUNSELOR",
  MANAGER = "MANAGER",
}

function getProvider(): ethers.providers.Web3Provider {
  if (!window.ethereum) throw new Error("No MetaMask found");

  return new ethers.providers.Web3Provider(window.ethereum);
}

function getContract(provider?: ethers.providers.Web3Provider) {
  if (!provider) provider = getProvider();
  return new ethers.Contract(
    ADAPTER_ADDRESS,
    ABI,
    provider
  ) as unknown as ContractContext;
}

export async function doLogin() {
  const provider = getProvider();

  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];

  if (!accounts || !accounts.length)
    throw new Error("Wallet not found/allowed.");

  const contract = getContract(provider);

  const manager = await contract.getManager();
  const isManager = accounts[0].toUpperCase() === manager.toUpperCase();

  if (isManager) {
    localStorage.setItem("profile", Profiler.MANAGER);
  } else {
    localStorage.setItem("profile", Profiler.RESIDENT);
  }

  localStorage.setItem("account", accounts[0].toUpperCase());

  return {
    profile: (localStorage.getItem("profile") || Profiler.RESIDENT) as Profiler,
    account: accounts[0].toUpperCase(),
  };
}

export function doLogout() {
  localStorage.removeItem("account");
  localStorage.removeItem("profile");
}
