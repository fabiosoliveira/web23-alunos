import { beforeAll, describe, expect, test } from "vitest";
import Wallet from "../src/lib/Wallet";
import TransactionInput from "../src/lib/TransactionInput";

describe("Transaction input tests", () => {
  let alice: Wallet, bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("Shuld be valid", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (defaults)", () => {
    const txInput = new TransactionInput();

    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (empty signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (negative amount)", () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (invalid signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(bob.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });
});
