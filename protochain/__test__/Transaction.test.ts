import { describe, expect, test, vi } from "vitest";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";
import TransactionInput from "../src/lib/TransactionInput";

vi.mock("../src/lib/TransactionInput");

describe("Transactions tests", () => {
  test("Shuld be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteiraTo",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (invalid hash)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteiraTo",
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld be valid (FEE)", () => {
    const tx = new Transaction({
      to: "carteiraTo",
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInput = undefined;
    tx.hash = tx.getHash();

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (invalid to)", () => {
    const tx = new Transaction();

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (invalid txInput)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput({
        amount: -10,
        fromAddress: "carteiraFrom",
        signature: "abc",
      } as TransactionInput),
      to: "carteiraTo",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});
