import { beforeAll, describe, expect, test } from "vitest";
import Wallet from "../src/lib/Wallet";

describe("Wallet tests", () => {
  const exempleWIF = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ";
  let alice: Wallet;

  beforeAll(() => {
    alice = new Wallet();
  });

  test("Shuld generate wallet", () => {
    const wallet = new Wallet();
    expect(wallet.privateKey).toBeTruthy();
    expect(wallet.publicKey).toBeTruthy();
  });

  test("Shuld recover wallet (PK)", () => {
    const wallet = new Wallet(alice.privateKey);
    expect(wallet.publicKey).toEqual(alice.publicKey);
  });

  test("Shuld recover wallet (WIF)", () => {
    const wallet = new Wallet(exempleWIF);
    expect(wallet.privateKey).toBeTruthy();
    expect(wallet.publicKey).toBeTruthy();
  });
});
