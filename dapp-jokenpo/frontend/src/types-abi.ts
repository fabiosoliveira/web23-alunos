import BN from "bn.js";
import BigNumber from "bignumber.js";
import {
  PromiEvent,
  TransactionReceipt,
  EventResponse,
  EventData,
  Web3ContractContext,
} from "ethereum-abi-types-generator";

export interface CallOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

export interface SendOptions {
  from?: string;
  value?: number | string | BN | BigNumber;
  gasPrice?: string;
  gas?: number;
}

export interface EstimateGasOptions {
  from?: string;
  value?: number | string | BN | BigNumber;
  gas?: number;
}

export interface MethodPayableReturnContext {
  send(options?: SendOptions): PromiEvent<TransactionReceipt>;
  send(
    options: SendOptions,
    callback: (error: Error, result: any) => void
  ): PromiEvent<TransactionReceipt>;
  estimateGas(options: EstimateGasOptions): Promise<number>;
  estimateGas(
    options: EstimateGasOptions,
    callback: (error: Error, result: any) => void
  ): Promise<number>;
  encodeABI(): string;
}

export interface MethodConstantReturnContext<TCallReturn> {
  call(): Promise<TCallReturn>;
  call(options: CallOptions): Promise<TCallReturn>;
  call(
    options: CallOptions,
    callback: (error: Error, result: TCallReturn) => void
  ): Promise<TCallReturn>;
  encodeABI(): string;
}

export interface MethodReturnContext extends MethodPayableReturnContext {}

export type ContractContext = Web3ContractContext<
  TypesAbi,
  TypesAbiMethodNames,
  TypesAbiEventsContext,
  TypesAbiEvents
>;
export type TypesAbiEvents = "Played";
export interface TypesAbiEventsContext {
  Played(
    parameters: {
      filter?: { player?: string | string[] };
      fromBlock?: "latest" | number;
      toBlock?: "latest" | number;
      topics?: string[];
    },
    callback?: (error: Error, event: EventData) => void
  ): EventResponse;
}
export type TypesAbiMethodNames =
  | "new"
  | "owner"
  | "getAddress"
  | "getResult"
  | "getBid"
  | "getCommission"
  | "setBid"
  | "setCommission"
  | "getBalance"
  | "play"
  | "getLeaderboard"
  | "upgrade";
export interface PlayedEventEmittedResponse {
  player: string;
  result: string;
}
export interface PlayerResponse {
  wallet: string;
  wins: string;
}
export interface TypesAbi {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: constructor
   */
  "new"(): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  owner(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getAddress(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getResult(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getBid(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getCommission(): MethodConstantReturnContext<string>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newBid Type: uint256, Indexed: false
   */
  setBid(newBid: string): MethodReturnContext;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newCommission Type: uint8, Indexed: false
   */
  setCommission(newCommission: string | number): MethodReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getBalance(): MethodConstantReturnContext<string>;
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param newChoice Type: uint8, Indexed: false
   */
  play(newChoice: string | number): MethodPayableReturnContext;
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  getLeaderboard(): MethodConstantReturnContext<PlayerResponse[]>;
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newImplementation Type: address, Indexed: false
   */
  upgrade(newImplementation: string): MethodReturnContext;
}
