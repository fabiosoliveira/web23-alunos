import Block from "./Block";
import BlockInfo from "./BlockInfo";
import Transaction from "./Transaction";
import TransactionInput from "./TransactionInput";
import TransactionOutput from "./TransactionOutput";
import TransactionSearch from "./TransactionSearch";
import TransactionType from "./TransactionType";
import Validation from "./Validation";

/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[];
  mempool: Transaction[];
  nextIndex = 0;
  static readonly DIFFICULTY_FACTOR = 5;
  static readonly TX_PER_BLOCK = 2;
  static readonly MAX_DIFFICULTY = 62;

  /**
   * Creates a new blockchain
   */
  constructor(miner: string) {
    this.blocks = [];
    this.mempool = [];

    const genesis = this.createGenesis(miner);
    this.blocks.push(genesis);

    this.nextIndex++;
  }

  createGenesis(miner: string): Block {
    const amount = Blockchain.getRewardAmount(this.getDifficulty());

    const tx = Transaction.fromReward(
      new TransactionOutput({
        toAddress: miner,
        amount,
      } as TransactionOutput)
    );

    const block = new Block();
    block.transactions = [tx];
    block.mine(this.getDifficulty(), miner);

    return block;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1;
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInputs && transaction.txInputs.length) {
      const from = transaction.txInputs[0].fromAddress;
      const pendingTx = this.mempool
        .filter((tx) => tx.txInputs && tx.txInputs.length)
        .map((tx) => tx.txInputs)
        .flat()
        .filter((tx) => tx!.fromAddress === from);

      if (pendingTx && pendingTx.length) {
        return new Validation(false, `This wallet has a pending transaction.`);
      }

      const utxo = this.getUtxo(from);

      for (let i = 0; i < transaction.txInputs.length; i++) {
        const txi = transaction.txInputs[i];
        if (
          utxo.findIndex(
            (txo) => txo.tx === txi.previousTx && txo.amount >= txi.amount
          ) === -1
        ) {
          return new Validation(
            false,
            `Invalid tx: the TXO is already spent or unexistent.`
          );
        }
      }
    }

    const validation = transaction.isValid(
      this.getDifficulty(),
      this.getFeePerTx()
    );
    if (!validation.success)
      return new Validation(false, `Invalid tx: ${validation.message}`);

    if (
      this.blocks.some((b) =>
        b.transactions.some((tx) => tx.hash === transaction.hash)
      )
    )
      return new Validation(false, `Duplicated tx in blockchain.`);

    this.mempool.push(transaction);
    return new Validation(true, transaction.hash);
  }

  addBlock(block: Block): Validation {
    const nextBlock = this.getNextBlock();
    if (!nextBlock) {
      return new Validation(false, "There is no next block info.");
    }

    const validation = block.isValid(
      nextBlock.previousHash,
      nextBlock.index - 1,
      nextBlock.difficulty,
      nextBlock.feePerTx
    );
    if (!validation.success)
      return new Validation(false, `Invalid block: ${validation.message}`);

    const txs = block.transactions
      .filter((tx) => tx.type !== TransactionType.FEE)
      .map((tx) => tx.hash);

    const newMempool = this.mempool.filter((tx) => !txs.includes(tx.hash));
    if (newMempool.length + txs.length !== this.mempool.length)
      return new Validation(false, `Invalid tx in block: mempool`);

    this.mempool = newMempool;

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation(true, block.hash);
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((b) => b.hash === hash);
  }

  getTransaction(hash: string): TransactionSearch {
    const mempoolIndex = this.mempool.findIndex((tx) => tx.hash === hash);
    if (mempoolIndex !== -1) {
      return {
        mempoolIndex,
        transaction: this.mempool[mempoolIndex],
      };
    }

    const blockIndex = this.blocks.findIndex((b) =>
      b.transactions.some((tx) => tx.hash === hash)
    );
    if (blockIndex !== -1) {
      return {
        blockIndex,
        transaction: this.blocks[blockIndex].transactions.find(
          (tx) => tx.hash === hash
        ),
      };
    }

    return { blockIndex: -1, mempoolIndex: -1 };
  }

  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      const validation = currentBlock.isValid(
        previousBlock.hash,
        previousBlock.index,
        this.getDifficulty(),
        this.getFeePerTx()
      );
      if (!validation.success)
        return new Validation(
          false,
          `Invalid block #${currentBlock.index}: ${validation.message}`
        );
    }
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo | null {
    if (!this.mempool || !this.mempool.length) return null;

    return {
      transactions: this.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      difficulty: this.getDifficulty(),
      previousHash: this.getLastBlock().hash,
      index: this.blocks.length,
      feePerTx: this.getFeePerTx(),
      maxDifficulty: Blockchain.MAX_DIFFICULTY,
    };
  }

  getTxInputs(wallet: string): (TransactionInput | undefined)[] {
    return this.blocks
      .map((b) => b.transactions)
      .flat()
      .filter((tx) => tx.txInputs && tx.txInputs.length)
      .map((tx) => tx.txInputs)
      .flat()
      .filter((txi) => txi!.fromAddress === wallet);
  }

  getTxOutputs(wallet: string): TransactionOutput[] {
    return this.blocks
      .map((b) => b.transactions)
      .flat()
      .filter((tx) => tx.txOutputs && tx.txOutputs.length)
      .map((tx) => tx.txOutputs)
      .flat()
      .filter((txo) => txo.toAddress === wallet);
  }

  getUtxo(wallet: string): TransactionOutput[] {
    const txIns = this.getTxInputs(wallet);
    const txOuts = this.getTxOutputs(wallet);

    if (!txIns || !txIns.length) return txOuts;

    txIns.forEach((txi) => {
      const index = txOuts.findIndex((txo) => txo.amount === txi!.amount);
      txOuts.splice(index, 1);
    });

    return txOuts;
  }

  getBalance(wallet: string): number {
    const utxo = this.getUtxo(wallet);

    if (!utxo || !utxo.length) return 0;

    return utxo.reduce((acc, txo) => acc + txo.amount, 0);
  }

  static getRewardAmount(difficulty: number): number {
    return (64 - difficulty) * 10;
  }
}
