import { beforeAll, describe, expect, test } from "vitest";
import Wallet from "../src/lib/Wallet";
import TransactionInput from "../src/lib/TransactionInput";
import TransactionOutput from "../src/lib/TransactionOutput";

describe("TransactionInput tests", () => {
  let alice: Wallet, bob: Wallet;
  const exampleTx: string =
    "8eba6c75bbd12d9e21f657b76726312aad08f2d3a10aee52d2b1017e6248c186";

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("Should be valid", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (defaults)", () => {
    const txInput = new TransactionInput();
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (empty signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (negative amount)", () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
      previousTx: "abc",
    } as TransactionInput);
    txInput.sign(bob.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid previousTx)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);
    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should create from TXO", () => {
    const txi = TransactionInput.fromTxo({
      amount: 10,
      toAddress: alice.publicKey,
      tx: exampleTx,
    } as TransactionOutput);
    txi.sign(alice.privateKey);

    txi.amount = 11;
    const result = txi.isValid();
    expect(result.success).toBeFalsy();
  });
});
