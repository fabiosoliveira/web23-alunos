import BlockInfo from "../BlockInfo";
import Transaction from "./Transaction";
import Validation from "../Validation";
import Block from "./Block";
import TransactionType from "../TransactionType";
import TransactionSearch from "../TransactionSearch";

/**
 * Blockchain mock class
 */
export default class Blockchain {
  blocks: Block[];
  mempool: Transaction[];
  nextIndex = 0;

  /**
   * Creates a new blockchain mock
   */
  constructor() {
    this.mempool = [];
    this.blocks = [
      new Block({
        index: 0,
        hash: "abc",
        previousHash: "",
        transactions: [
          new Transaction({
            type: TransactionType.FEE,
            data: "tx1",
          } as Transaction),
        ],
        timestamp: Date.now(),
      } as Block),
    ];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  addTransaction(transaction: Transaction): Validation {
    const validation = transaction.isValid();
    if (!validation.success) return validation;

    this.mempool.push(transaction);
    return new Validation(true, transaction.hash);
  }

  addBlock(block: Block): Validation {
    if (block.index < 0) return new Validation(false, `Invalid mock block`);

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation();
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((b) => b.hash === hash);
  }

  getTransaction(hash: string): TransactionSearch {
    return { mempoolIndex: 0, transaction: { hash } } as TransactionSearch;
  }

  isValid(): Validation {
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo {
    return {
      transactions: [
        new Transaction({
          data: new Date().toString(),
        } as Transaction),
      ],
      difficulty: 0,
      previousHash: this.getLastBlock().hash,
      index: 1,
      feePerTx: this.getFeePerTx(),
      maxDifficulty: 62,
    };
  }
}
