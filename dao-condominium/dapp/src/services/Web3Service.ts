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

type ContractResponse = Promise<ethers.ContractTransaction & { hash: string }>;

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

function getProvider(): ethers.BrowserProvider {
  if (!window.ethereum) throw new Error("No MetaMask found");

  return new ethers.BrowserProvider(window.ethereum);
}

function getContract(provider?: ethers.BrowserProvider) {
  if (!provider) provider = getProvider();
  return new ethers.Contract(
    ADAPTER_ADDRESS,
    ABI,
    provider
  ) as unknown as ContractContext;
}

async function getContractSigner(provider?: ethers.BrowserProvider) {
  if (!provider) provider = getProvider();
  const signer = await provider.getSigner(
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

  const signer = await provider.getSigner();
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
  total: ethers.BigNumberish;
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
    total: result.total as ethers.BigNumberish,
  };
}

export async function getResident(wallet: string): Promise<Resident> {
  const contract = getContract();

  return contract.getResident(wallet);
}

export async function upgrade(address: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();
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

  const contract = await getContractSigner();
  return contract.addResident(wallet, residenceId) as ContractResponse;
}

export async function removeResident(wallet: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();
  return contract.removeResident(wallet) as ContractResponse;
}

export async function setCouncelor(wallet: string, isEntering: boolean) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();
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
  amount: ethers.BigNumberish;
  responsible: string;
  status?: Status;
  createdDate?: ethers.BigNumberish;
  startDate?: ethers.BigNumberish;
  endDate?: ethers.BigNumberish;
};

export type TopicPage = {
  topics: Topic[];
  total: ethers.BigNumberish;
};

export async function getTopics(page = 1, pageSize = 10): Promise<TopicPage> {
  const contract = getContract();

  const result = await contract.getTopics(page, pageSize);
  const topics = result.topics.filter((t) => t.title);

  return {
    topics,
    total: result.total as ethers.BigNumberish,
  };
}

export async function getTopic(title: string): Promise<Topic> {
  const contract = getContract();

  return contract.getTopic(title);
}

export async function removeTopic(title: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();
  return contract.removeTopic(title) as ContractResponse;
}

export async function addTopic(topic: Topic) {
  const contract = await getContractSigner();
  topic.amount = ethers.toBigInt(topic.amount || 0);
  return contract.addTopic(
    topic.title,
    topic.description,
    topic.category,
    topic.amount,
    topic.responsible
  ) as ContractResponse;
}

export async function editTopic(
  topicToEdit: string,
  description: string,
  amount: ethers.BigNumberish,
  responsible: string
) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();
  amount = ethers.toBigInt(amount || 0);
  return contract.editTopic(
    topicToEdit,
    description,
    amount,
    responsible
  ) as ContractResponse;
}

export async function openVoting(topic: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();

  return contract.openVoting(topic) as ContractResponse;
}

export async function closeVoting(topic: string) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();

  return contract.closeVoting(topic) as ContractResponse;
}

export async function payQuota(
  residenceId: number,
  value: ethers.BigNumberish
) {
  if (getProfile() !== Profiler.RESIDENT)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();

  return contract.payQuota(residenceId, { value });
}

export async function getQuota(): Promise<ethers.BigNumberish> {
  const contract = getContract();

  const quota = (await contract.getQuota()) as ethers.BigNumberish;
  return quota;
}

export enum Options {
  EMPTY = 0,
  YES = 1,
  NO = 2,
  ABSTENTION = 3,
}

export type Vote = {
  resident: string;
  residence: number;
  timestamp: number;
  option: Options;
};

export async function getVotes(topic: string): Promise<Vote[]> {
  const contract = getContract();

  return contract.getVotes(topic);
}

export async function vote(topic: string, option: Options) {
  const contract = await getContractSigner();

  return contract.vote(topic, option) as ContractResponse;
}

export async function transfer(topic: string, amount: ethers.BigNumberish) {
  if (getProfile() !== Profiler.MANAGER)
    throw new Error("You do not have permission.");

  const contract = await getContractSigner();

  return contract.transfer(topic, amount) as ContractResponse;
}

export async function getBalance(address?: string): Promise<string> {
  if (!address) address = await getAddress();
  const provider = getProvider();
  const balance = await provider.getBalance(address);

  return ethers.formatEther(balance);
}
