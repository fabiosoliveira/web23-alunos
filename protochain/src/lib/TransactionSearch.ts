import Transaction from "./Transaction";

export default interface TransactionSearch {
  transaction: Transaction;
  mempoolIndex: number;
  blockIndex: number;
}
