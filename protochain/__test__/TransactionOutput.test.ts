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
    const txInput = new TransactionOutput({
      amount: 10,
      toAddress: alice.publicKey,
      tx: "abc",
    } as TransactionOutput);

    const valid = txInput.isValid();
    expect(valid.success).toBeTruthy();
  });
});
