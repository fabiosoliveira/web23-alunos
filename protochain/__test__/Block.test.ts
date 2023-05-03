import { beforeAll, describe, expect, test } from "vitest";
import Block from "../src/lib/Block";
import BlockInfo from "../src/lib/BlockInfo";

describe("Block tests", () => {
  const exempleDifficulty = 0;
  const exempleMiner = "Outro";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      data: "Genesis Block",
    } as Block);
  });

  test("Shuld be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);

    block.mine(exempleDifficulty, exempleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld create from block info", () => {
    const block = Block.fromBlockInfo({
      data: "block 2",
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

  test("Shuld not be valid (fallbacks)", () => {
    const block = new Block();
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
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
      data: "block 2",
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
      data: "block 2",
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (data)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index, exempleDifficulty);
    expect(valid.success).toBeFalsy();
  });
});
