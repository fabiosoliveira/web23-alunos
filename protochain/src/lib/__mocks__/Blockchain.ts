import BlockInfo from "../BlockInfo";
import Transaction from "./Transaction";
import Validation from "../Validation";
import Block from "./Block";
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
  constructor(miner: string) {
    this.blocks = [];
    this.mempool = [new Transaction()];

    this.blocks.push(
      new Block({
        index: 0,
        hash: "abc",
        previousHash: "",
        miner,
        timestamp: Date.now(),
      } as Block)
    );
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
    if (!hash || hash === "-1") return undefined;
    return this.blocks.find((b) => b.hash === hash);
  }

  getTransaction(hash: string): TransactionSearch {
    if (hash === "-1") {
      return { mempoolIndex: -1, blockIndex: -1 } as TransactionSearch;
    }
    return {
      mempoolIndex: 0,
      transaction: new Transaction(),
    } as TransactionSearch;
  }

  isValid(): Validation {
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo {
    return {
      transactions: this.mempool.slice(0, 2),
      difficulty: 1,
      previousHash: this.getLastBlock().hash,
      index: this.blocks.length,
      feePerTx: this.getFeePerTx(),
      maxDifficulty: 62,
    };
  }
}
