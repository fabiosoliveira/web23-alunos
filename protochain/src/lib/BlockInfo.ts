import Transaction from "./Transaction";

/**
 * The BlockInfo interface
 */
export default interface BlockInfo {
  index: number;
  previousHash: string;
  difficulty: number;
  maxDifficulty: number;
  feePerTx: number;
  transactions: Transaction[];
}
