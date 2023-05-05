import { describe, expect, test } from "vitest";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";

describe("Transactions tests", () => {
  test("Shuld be valid (REGULAR default)", () => {
    const tx = new Transaction({
      data: "tx",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (invalid hash)", () => {
    const tx = new Transaction({
      data: "tx",
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld be valid (FEE)", () => {
    const tx = new Transaction({
      data: "tx",
      type: TransactionType.FEE,
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (invalid data)", () => {
    const tx = new Transaction();

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});
