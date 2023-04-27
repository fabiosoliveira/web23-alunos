import { describe, expect, test } from "vitest";
import Blockchain from "../src/lib/Blockchain";

describe("Blockchain tests", () => {
  test("Shuld has genesis blocks", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toEqual(1);
  });
});
