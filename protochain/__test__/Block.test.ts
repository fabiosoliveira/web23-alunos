import { beforeAll, describe, expect, test, vi } from "vitest";
import Block from "../src/lib/Block";
import BlockInfo from "../src/lib/BlockInfo";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";

vi.mock("../src/lib/Transaction");

describe("Block tests", () => {
  const exempleDifficulty = 0;
  const exempleMiner = "Outro";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      transactions: [
        new Transaction({
          data: "Genesis block",
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
          data: "block 2",
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld create from block info", () => {
    const block = Block.fromBlockInfo({
      transactions: [
        new Transaction({
          data: "block 2",
        } as Transaction),
      ],
      difficulty: exempleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);

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
          data: "fee 1",
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          data: "fee 2",
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

    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (fallbacks)", () => {
    const block = new Block();
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          data: "block 2",
        } as Transaction),
      ],
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          data: "block 2",
        } as Transaction),
      ],
    } as Block);
    block.timestamp = -1;
    block.hash = block.getHash();
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (empty hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          data: "block 2",
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, exempleMiner);
    block.hash = "";

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (no hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          data: "block 2",
        } as Transaction),
      ],
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (data)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          data: "",
        } as Transaction),
      ],
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          data: "block 2",
        } as Transaction),
      ],
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });
});
