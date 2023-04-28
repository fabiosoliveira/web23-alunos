import { beforeAll, describe, expect, test } from "vitest";
import Block from "../src/lib/Block";

describe("Block tests", () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block(0, "", "Genesis Block");
  });

  test("Shuld be valid", () => {
    const block = new Block(1, genesis.hash, "block 2");
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeTruthy();
  });

  test("Shuld Not be valid (previous hash)", () => {
    const block = new Block(1, "abc", "block 2");
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (timestamp)", () => {
    const block = new Block(1, genesis.hash, "block 2");
    block.timestamp = -1;
    block.hash = block.getHash();
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (hash)", () => {
    const block = new Block(1, genesis.hash, "block 2");
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (data)", () => {
    const block = new Block(1, genesis.hash, "");
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (index)", () => {
    const block = new Block(-1, genesis.hash, "block 2");
    const valid = block.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });
});
