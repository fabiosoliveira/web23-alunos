import { beforeAll, describe, expect, test } from "vitest";
import Block from "../src/lib/Block";

describe("Block tests", () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      index: 0,
      previousHash: "",
      data: "Genesis Block",
    } as Block);
  });

  test("Shuld be valid", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (fallbacks)", () => {
    const block = new Block();
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);
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
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (data)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "block 2",
    } as Block);
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });
});
