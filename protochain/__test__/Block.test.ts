import { describe, expect, test } from "vitest";
import Block from "../src/lib/Block";

describe("Block tests", () => {
  test("Shuld be valid", () => {
    const block = new Block(1, "abc");
    const valid = block.isValid();
    expect(valid).toBeTruthy();
  });

  test("Shuld Not be valid (hash)", () => {
    const block = new Block(1, "");
    const valid = block.isValid();
    expect(valid).toBeFalsy();
  });

  test("Shuld Not be valid (index)", () => {
    const block = new Block(-1, "abc");
    const valid = block.isValid();
    expect(valid).toBeFalsy();
  });
});
