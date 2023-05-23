import { beforeAll, describe, expect, test } from "vitest";
import Wallet from "../src/lib/Wallet";
import TransactionOutput from "../src/lib/TransactionOutput";

describe("Transaction output tests", () => {
  let alice: Wallet, bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("Shuld be valid", () => {
    const txOutput = new TransactionOutput({
      amount: 10,
      toAddress: alice.publicKey,
      tx: "abc",
    } as TransactionOutput);

    const valid = txOutput.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (default)", () => {
    const txOutput = new TransactionOutput();

    const valid = txOutput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid", () => {
    const txOutput = new TransactionOutput({
      amount: -10,
      toAddress: alice.publicKey,
      tx: "abc",
    } as TransactionOutput);

    const valid = txOutput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld get hash", () => {
    const txOutput = new TransactionOutput({
      amount: 10,
      toAddress: alice.publicKey,
      tx: "abc",
    } as TransactionOutput);

    const hash = txOutput.getHash();
    expect(hash).toBeTruthy();
  });
});
