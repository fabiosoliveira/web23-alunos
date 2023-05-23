import { beforeAll, describe, expect, test, vi } from "vitest";
import Blockchain from "../src/lib/Blockchain";
import Block from "../src/lib/Block";
import Transaction from "../src/lib/Transaction";
import TransactionInput from "../src/lib/TransactionInput";
import Wallet from "../src/lib/Wallet";

vi.mock("../src/lib/Block");
vi.mock("../src/lib/Transaction");
vi.mock("../src/lib/TransactionInput");

describe("Blockchain tests", () => {
  let alice: Wallet;

  beforeAll(() => {
    alice = new Wallet();
  });

  test("Shuld has genesis blocks", () => {
    const blockchain = new Blockchain(alice.publicKey);
    expect(blockchain.blocks.length).toEqual(1);
  });

  test("Shuld be valid (genesis)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Shuld be valid (two blocks)", () => {
    const blockchain = new Blockchain(alice.publicKey);
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [
          new Transaction({
            txInputs: [new TransactionInput()],
          } as Transaction),
        ],
      } as Block)
    );
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Shuld not be valid", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
    } as Transaction);

    blockchain.mempool.push(tx);

    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block)
    );
    blockchain.blocks[1].index = -1;
    expect(blockchain.isValid().success).toEqual(false);
  });

  test("Shuld add transaction", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toEqual(true);
  });

  test("Shuld not add transaction (pending tx)", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    blockchain.addTransaction(tx);

    const tx2 = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz2",
    } as Transaction);

    const validation = blockchain.addTransaction(tx2);

    expect(validation.success).toBeFalsy();
  });

  test("Shuld not add transaction (invalid tx)", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
      timestamp: -1,
    } as Transaction);

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toEqual(false);
  });

  test("Shuld not add transaction (duplicated in blockchain)", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    blockchain.blocks.push(
      new Block({
        transactions: [tx],
      } as Block)
    );

    const validation = blockchain.addTransaction(tx);

    expect(validation.success).toEqual(false);
  });

  test("Shuld get transaction (mempool)", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "abc",
    } as Transaction);

    blockchain.mempool.push(tx);

    const result = blockchain.getTransaction("abc");

    expect(result.mempoolIndex).toEqual(0);
  });

  test("Shuld get transaction (blockchain)", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      hash: "xyz",
    } as Transaction);

    blockchain.blocks.push(new Block({ transactions: [tx] } as Block));

    const result = blockchain.getTransaction("xyz");

    expect(result.blockIndex).toEqual(1);
  });

  test("Shuld not get transaction", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const result = blockchain.getTransaction("xyz");

    expect(result.blockIndex).toEqual(-1);
    expect(result.mempoolIndex).toEqual(-1);
  });

  test("Shuld add block", () => {
    const blockchain = new Blockchain(alice.publicKey);

    const tx = new Transaction({
      txInputs: [new TransactionInput()],
    } as Transaction);

    blockchain.mempool.push(tx);

    const result = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block)
    );
    expect(result.success).toEqual(true);
  });

  test("Shuld get block", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const block = blockchain.getBlock(blockchain.blocks[0].hash);
    expect(block).toBeTruthy();
  });

  test("Shuld not add block", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const result = blockchain.addBlock(
      new Block({
        index: -1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [
          new Transaction({
            txInputs: [new TransactionInput()],
          } as Transaction),
        ],
      } as Block)
    );
    expect(result.success).toEqual(false);
  });

  test("Shuld get next block info", () => {
    const blockchain = new Blockchain(alice.publicKey);
    blockchain.mempool.push(new Transaction());

    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toEqual(1);
  });

  test("Shuld not get next block info", () => {
    const blockchain = new Blockchain(alice.publicKey);
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
  });
});
