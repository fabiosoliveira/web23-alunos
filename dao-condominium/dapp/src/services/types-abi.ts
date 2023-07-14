import {
  ContractTransaction,
  ContractInterface,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
} from 'ethers';
import { EthersContractContextV5 } from 'ethereum-abi-types-generator';

export type ContractContext = EthersContractContextV5<
  TypesAbi,
  TypesAbiMethodNames,
  TypesAbiEventsContext,
  TypesAbiEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type TypesAbiEvents =
  | 'ManagerChanged'
  | 'QuotaChanged'
  | 'TopicChanged'
  | 'Transfer';
export interface TypesAbiEventsContext {
  ManagerChanged(...parameters: any): EventFilter;
  QuotaChanged(...parameters: any): EventFilter;
  TopicChanged(...parameters: any): EventFilter;
  Transfer(...parameters: any): EventFilter;
}
export type TypesAbiMethodNames =
  | 'new'
  | 'addResident'
  | 'addTopic'
  | 'closeVoting'
  | 'editTopic'
  | 'getAddress'
  | 'getManager'
  | 'getQuota'
  | 'getResident'
  | 'getResidents'
  | 'getTopic'
  | 'getTopics'
  | 'getVotes'
  | 'openVoting'
  | 'owner'
  | 'payQuota'
  | 'removeResident'
  | 'removeTopic'
  | 'setCounselor'
  | 'transfer'
  | 'upgrade'
  | 'vote';
export interface ManagerChangedEventEmittedResponse {
  manager: string;
}
export interface QuotaChangedEventEmittedResponse {
  amount: BigNumberish;
}
export interface TopicChangedEventEmittedResponse {
  topicId: Arrayish;
  title: string;
  status: BigNumberish;
}
export interface TransferEventEmittedResponse {
  to: string;
  amount: BigNumberish;
  topic: string;
}
export interface ResidentResponse {
  wallet: string;
  0: string;
  residence: number;
  1: number;
  isCounselor: boolean;
  2: boolean;
  isManager: boolean;
  3: boolean;
  nextPayment: BigNumber;
  4: BigNumber;
}
export interface ResidentsResponse {
  wallet: string;
  0: ResidentsResponse[];
  residence: number;
  1: ResidentsResponse[];
  isCounselor: boolean;
  2: ResidentsResponse[];
  isManager: boolean;
  3: ResidentsResponse[];
  nextPayment: BigNumber;
  4: ResidentsResponse[];
}
export interface ResidentpageResponse {
  residents: ResidentsResponse[];
  0: ResidentsResponse[];
  total: BigNumber;
  1: BigNumber;
}
export interface TopicResponse {
  title: string;
  0: string;
  description: string;
  1: string;
  status: number;
  2: number;
  createdDate: BigNumber;
  3: BigNumber;
  startDate: BigNumber;
  4: BigNumber;
  endDate: BigNumber;
  5: BigNumber;
  category: number;
  6: number;
  amount: BigNumber;
  7: BigNumber;
  responsible: string;
  8: string;
}
export interface TopicsResponse {
  title: string;
  0: TopicsResponse[];
  description: string;
  1: TopicsResponse[];
  status: number;
  2: TopicsResponse[];
  createdDate: BigNumber;
  3: TopicsResponse[];
  startDate: BigNumber;
  4: TopicsResponse[];
  endDate: BigNumber;
  5: TopicsResponse[];
  category: number;
  6: TopicsResponse[];
  amount: BigNumber;
  7: TopicsResponse[];
  responsible: string;
  8: TopicsResponse[];
}
export interface TopicpageResponse {
  topics: TopicsResponse[];
  0: TopicsResponse[];
  total: BigNumber;
  1: BigNumber;
}
export interface VoteResponse {
  resident: string;
  0: string;
  residence: number;
  1: number;
  option: number;
  2: number;
  timestamp: BigNumber;
  3: BigNumber;
}
export interface TypesAbi {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  'new'(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param resident Type: address, Indexed: false
   * @param residenceId Type: uint16, Indexed: false
   */
  addResident(
    resident: string,
    residenceId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param title Type: string, Indexed: false
   * @param description Type: string, Indexed: false
   * @param category Type: uint8, Indexed: false
   * @param amount Type: uint256, Indexed: false
   * @param responsible Type: address, Indexed: false
   */
  addTopic(
    title: string,
    description: string,
    category: BigNumberish,
    amount: BigNumberish,
    responsible: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param title Type: string, Indexed: false
   */
  closeVoting(
    title: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param topicToEdit Type: string, Indexed: false
   * @param description Type: string, Indexed: false
   * @param amount Type: uint256, Indexed: false
   * @param responsible Type: address, Indexed: false
   */
  editTopic(
    topicToEdit: string,
    description: string,
    amount: BigNumberish,
    responsible: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getAddress(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getManager(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getQuota(overrides?: ContractCallOverrides): Promise<BigNumber>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param resident Type: address, Indexed: false
   */
  getResident(
    resident: string,
    overrides?: ContractCallOverrides
  ): Promise<ResidentResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param page Type: uint256, Indexed: false
   * @param pageSize Type: uint256, Indexed: false
   */
  getResidents(
    page: BigNumberish,
    pageSize: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<ResidentpageResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param title Type: string, Indexed: false
   */
  getTopic(
    title: string,
    overrides?: ContractCallOverrides
  ): Promise<TopicResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param page Type: uint256, Indexed: false
   * @param pageSize Type: uint256, Indexed: false
   */
  getTopics(
    page: BigNumberish,
    pageSize: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<TopicpageResponse>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param topicTitle Type: string, Indexed: false
   */
  getVotes(
    topicTitle: string,
    overrides?: ContractCallOverrides
  ): Promise<VoteResponse[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param title Type: string, Indexed: false
   */
  openVoting(
    title: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(overrides?: ContractCallOverrides): Promise<string>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param residenceId Type: uint16, Indexed: false
   */
  payQuota(
    residenceId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param resident Type: address, Indexed: false
   */
  removeResident(
    resident: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param title Type: string, Indexed: false
   */
  removeTopic(
    title: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param resident Type: address, Indexed: false
   * @param isEntering Type: bool, Indexed: false
   */
  setCounselor(
    resident: string,
    isEntering: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param topicTitle Type: string, Indexed: false
   * @param amount Type: uint256, Indexed: false
   */
  transfer(
    topicTitle: string,
    amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newImplementation Type: address, Indexed: false
   */
  upgrade(
    newImplementation: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param title Type: string, Indexed: false
   * @param option Type: uint8, Indexed: false
   */
  vote(
    title: string,
    option: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>;
}
