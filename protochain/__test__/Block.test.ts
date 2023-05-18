import { beforeAll, describe, expect, test, vi } from "vitest";
import Block from "../src/lib/Block";
import BlockInfo from "../src/lib/BlockInfo";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";
import TransactionInput from "../src/lib/TransactionInput";

vi.mock("../src/lib/Transaction");
vi.mock("../src/lib/TransactionInput");

describe("Block tests", () => {
  const exempleDifficulty = 1;
  const exempleMiner = "Outro";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
  });

  test("Shuld be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (no fee)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld create from block info", () => {
    const block = Block.fromBlockInfo({
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
      difficulty: exempleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, exempleMiner);

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
          txInput: new TransactionInput(),
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, exempleMiner);

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
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, exempleMiner);

    block.transactions[0].to = "";

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (fallbacks)", () => {
    const block = new Block();
    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
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
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();
    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.timestamp = -1;

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();
    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (empty hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();

    block.mine(exempleDifficulty, exempleMiner);
    block.hash = "";

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (no mined)", () => {
    const block = new Block({
      index: 1,
      nonce: 0,
      miner: exempleMiner,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (txInpuut)", () => {
    const txInput = new TransactionInput();
    txInput.amount = -1;

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInput,
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
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
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        to: exempleMiner,
      } as Transaction)
    );

    block.hash = block.getHash();
    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });
});
