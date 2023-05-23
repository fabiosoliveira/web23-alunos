import { beforeAll, describe, expect, test, vi } from "vitest";
import Block from "../src/lib/Block";
import BlockInfo from "../src/lib/BlockInfo";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";
import TransactionInput from "../src/lib/TransactionInput";
import TransactionOutput from "../src/lib/TransactionOutput";
import Wallet from "../src/lib/Wallet";

vi.mock("../src/lib/Transaction");
vi.mock("../src/lib/TransactionInput");
vi.mock("../src/lib/TransactionOutput");

describe("Block tests", () => {
  const exempleDifficulty = 1;
  let allice: Wallet;
  let genesis: Block;

  beforeAll(() => {
    allice = new Wallet();

    genesis = new Block({
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
  });

  test("Shuld be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [] as Transaction[],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [
          new TransactionOutput({
            toAddress: allice.publicKey,
            amount: 1,
          } as TransactionOutput),
        ],
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (no fee)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld create from block info", () => {
    const block = Block.fromBlockInfo({
      transactions: [],
      difficulty: exempleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [
          new TransactionOutput({
            toAddress: allice.publicKey,
            amount: 1,
          } as TransactionOutput),
        ],
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (2 FEE)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [new TransactionInput()],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (invalid tx)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [new Transaction()],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, allice.publicKey);

    block.transactions[0].txOutputs[0].toAddress = "";

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (fallbacks)", () => {
    const block = new Block();
    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
    block.timestamp = -1;

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (empty hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, allice.publicKey);
    block.hash = "";

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (no mined)", () => {
    const block = new Block({
      index: 1,
      nonce: 0,
      miner: allice.publicKey,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (txInput)", () => {
    const txInputs = [new TransactionInput()];
    txInputs[0].amount = -1;

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs,
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });
});
