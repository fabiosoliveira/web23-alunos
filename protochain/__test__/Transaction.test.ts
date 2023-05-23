import { describe, expect, test, vi } from "vitest";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";
import TransactionInput from "../src/lib/TransactionInput";
import TransactionOutput from "../src/lib/TransactionOutput";

vi.mock("../src/lib/TransactionInput");
vi.mock("../src/lib/TransactionOutput");

describe("Transactions tests", () => {
  test("Shuld be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (txo hash !== tx hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    tx.txOutputs[0].tx = "sdf";

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (inputs < outputs)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput({ amount: 1 } as TransactionInput)],
      txOutputs: [new TransactionOutput({ amount: 2 } as TransactionOutput)],
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (invalid hash)", () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld be valid (FEE)", () => {
    const tx = new Transaction({
      txOutputs: [new TransactionOutput()],
      type: TransactionType.FEE,
    } as Transaction);

    tx.txInputs = undefined;
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
      txOutputs: [new TransactionOutput()],
      txInputs: [
        new TransactionInput({
          amount: -10,
          fromAddress: "carteiraFrom",
          signature: "abc",
        } as TransactionInput),
      ],
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});
