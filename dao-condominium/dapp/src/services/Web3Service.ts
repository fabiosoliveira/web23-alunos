import { ethers } from "ethers";
import ABI from "./ABI.json";
import { ContractContext } from "./types-abi";
import { doApiLogin } from "./ApiService";

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

  const signer = provider.getSigner();
  const timestamp = Date.now();
  const message = `Authenticating to Condominium. Timestamp: ${timestamp}`;
  const secret = await signer.signMessage(message);
  console.log(secret);

  const token = await doApiLogin(accounts[0], secret, timestamp);
  localStorage.setItem("token", token);

  return {
    token,
    profile: (localStorage.getItem("profile") || Profiler.RESIDENT) as Profiler,
    account: accounts[0].toUpperCase(),
  };
}

export function doLogout() {
  localStorage.removeItem("account");
  localStorage.removeItem("profile");
  localStorage.removeItem("token");
}

export async function getAddress() {
  const contract = getContract();

  return contract.getAddress();
}

export type ResidentPage = {
  residents: Resident[];
  total: ethers.BigNumber;
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
    total: ethers.BigNumber.from(result.total),
  };
}

export async function getResident(wallet: string): Promise<Resident> {
  const contract = getContract();

  return contract.getResident(wallet);
}

export async function upgrade(address: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.upgrade(address);
}

export function hasManagerPermissions() {
  return getProfile() === Profiler.MANAGER;
}

export function hasCounselorPermissions() {
  return getProfile() !== Profiler.RESIDENT;
}

export function hasResidentPermissions() {
  return getProfile() === Profiler.RESIDENT;
}

export async function addResident(wallet: string, residenceId: number) {
  if (getProfile() === Profiler.RESIDENT)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.addResident(wallet, residenceId);
}

export async function removeResident(wallet: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.removeResident(wallet);
}

export async function setCouncelor(wallet: string, isEntering: boolean) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.setCounselor(wallet, isEntering);
}

export enum Category {
  DECISION,
  SPENT,
  CHANGE_QUOTA,
  CHANGE_MANAGER,
}

export enum Status {
  IDLE,
  VOTING,
  APPROVED,
  DENIED,
  DELETED,
  SPENT,
} // 0, 1, 2, 3

export type Topic = {
  title: string;
  description: string;
  category: Category;
  amount: ethers.BigNumber;
  responsible: string;
  status?: Status;
  createdDate?: number;
  startDate?: number;
  endDate?: number;
};

export type TopicPage = {
  topics: Topic[];
  total: ethers.BigNumber;
};

export async function getTopics(page = 1, pageSize = 10): Promise<TopicPage> {
  const contract = getContract();

  const result = await contract.getTopics(page, pageSize);
  const topics = result.topics
    .filter((t) => t.title)
    .map((t) => ({
      ...t,
      createdDate: t.createdDate.toNumber(),
      startDate: t.startDate.toNumber(),
      endDate: t.endDate.toNumber(),
    }));

  return {
    topics,
    total: ethers.BigNumber.from(result.total),
  };
}

export async function getTopic(title: string): Promise<Topic> {
  const contract = getContract();

  const response = await contract.getTopic(title);

  return {
    ...response,
    startDate: response.startDate.toNumber(),
    endDate: response.endDate.toNumber(),
    createdDate: response.createdDate.toNumber(),
  };
}

export async function removeTopic(title: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  return contract.removeTopic(title);
}

export async function addTopic(topic: Topic) {
  const contract = getContractSigner();
  topic.amount = ethers.BigNumber.from(topic.amount || 0);
  return contract.addTopic(
    topic.title,
    topic.description,
    topic.category,
    topic.amount,
    topic.responsible
  );
}

export async function editTopic(
  topicToEdit: string,
  description: string,
  amount: ethers.BigNumber,
  responsible: string
) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = getContractSigner();
  amount = ethers.BigNumber.from(amount || 0);
  return contract.editTopic(topicToEdit, description, amount, responsible);
}
