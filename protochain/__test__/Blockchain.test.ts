import { describe, expect, test } from "vitest";
import Blockchain from "../src/lib/Blockchain";
import Block from "../src/lib/Block";

describe("Blockchain tests", () => {
  test("Shuld has genesis blocks", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toEqual(1);
  });

  test("Shuld be valid (genesis)", () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Shuld be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Shuld not be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));
    blockchain.blocks[1].data = "a transfere 2 para b";
    expect(blockchain.isValid().success).toEqual(false);
  });

  test("Shuld add block", () => {
    const blockchain = new Blockchain();
    const result = blockchain.addBlock(
      new Block(1, blockchain.blocks[0].hash, "Block 2")
    );
    expect(result.success).toEqual(true);
  });

  test("Shuld not add block", () => {
    const blockchain = new Blockchain();
    const result = blockchain.addBlock(
      new Block(-1, blockchain.blocks[0].hash, "Block 2")
    );
    expect(result.success).toEqual(false);
  });
});
