import { ethers } from "ethers";
import ABI from "./ABI.json";
import { ContractContext } from "./types-abi";

const ADAPTER_ADDRESS = import.meta.env.VITE_APP_ADAPTER_ADDRESS as string;

export enum Profiler {
  RESIDENT = "RESIDENT",
  COUNSELOR = "COUNSELOR",
  MANAGER = "MANAGER",
}

export type Resident = {
  wallet: string;
  isCounselor: boolean;
  isManager: boolean;
  residence: number;
  nextPayment: ethers.BigNumberish;
};

function getProfile() {
  const profile = localStorage.getItem("profile") || Profiler.RESIDENT;
  return profile;
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

function getContractSigner(provider?: ethers.providers.Web3Provider) {
  if (!provider) provider = getProvider();
  const signer = provider.getSigner(
    localStorage.getItem("account") || undefined
  );
  const contract = new ethers.Contract(
    ADAPTER_ADDRESS,
    ABI,
    provider
  ) as unknown as ContractContext;
  return contract.connect(signer);
}

export async function doLogin() {
  const provider = getProvider();

  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];

  if (!accounts || !accounts.length)
    throw new Error("Wallet not found/allowed.");

  const contract = getContract(provider);

  const resident = await contract.getResident(accounts[0]);
  let isManager = resident.isManager;

  if (!isManager && resident.residence > 0) {
    if (resident.isCounselor) {
      localStorage.setItem("profile", Profiler.COUNSELOR);
    } else {
      localStorage.setItem("profile", Profiler.RESIDENT);
    }
  } else if (!isManager && !resident.residence) {
    const manage = await contract.getManager();
    isManager = manage.toUpperCase() === accounts[0].toUpperCase();
  }

  if (isManager) {
    localStorage.setItem("profile", Profiler.MANAGER);
  } else if (localStorage.getItem("profile") === null) {
    throw new Error("Unoutorized");
  }

  localStorage.setItem("account", accounts[0]);

  return {
    profile: (localStorage.getItem("profile") || Profiler.RESIDENT) as Profiler,
    account: accounts[0].toUpperCase(),
  };
}

export function doLogout() {
  localStorage.removeItem("account");
  localStorage.removeItem("profile");
}

export async function getAddress() {
  const contract = getContract();

  return contract.getAddress();
}

export type ResidentPage = {
  residents: Resident[];
  total: number;
};

export async function getResidents(
  page = 1,
  pageSize = 10
): Promise<ResidentPage> {
  const contract = getContract();

  const result = await contract.getResidents(page, pageSize);
  const residents = result.residents
    .filter((r) => r.residence)
    .sort((a, b) => {
      if (a.residence > b.residence) return 1;
      return -1;
    });

  return {
    residents,
    total: ethers.BigNumber.from(result.total).toNumber(),
  };
}

export async function upgrade(address: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.upgrade(address);
}

export async function addResident(wallet: string, residenceId: number) {
  if (getProfile() === Profiler.RESIDENT)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.addResident(wallet, residenceId);
}

export function isManager() {
  return getProfile() === Profiler.MANAGER;
}
