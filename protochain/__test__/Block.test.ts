import { beforeAll, describe, expect, test, vi } from "vitest";
import Block from "../src/lib/Block";
import BlockInfo from "../src/lib/BlockInfo";
import Transaction from "../src/lib/Transaction";
import TransactionType from "../src/lib/TransactionType";
import TransactionInput from "../src/lib/TransactionInput";
import TransactionOutput from "../src/lib/TransactionOutput";
import Wallet from "../src/lib/Wallet";

vi.mock("../src/lib/Transaction");
vi.mock("../src/lib/TransactionInput");
vi.mock("../src/lib/TransactionOutput");

describe("Block tests", () => {
  const exempleDifficulty = 1;
  const exempleFee = 1;
  const exampleTx =
    "02739e89b5a81367cada5ccb146dd987d7ef6764f1cf107203b67e0fc193a9b707";
  let allice: Wallet, bob: Wallet;
  let genesis: Block;

  beforeAll(() => {
    allice = new Wallet();
    bob = new Wallet();

    genesis = new Block({
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);
  });

  function getFullBlock(): Block {
    const txIn = new TransactionInput({
      amount: 10,
      fromAddress: allice.publicKey,
      previousTx: exampleTx,
    } as TransactionInput);

    txIn.sign(allice.privateKey);

    const txOut = new TransactionOutput({
      amount: 10,
      toAddress: bob.publicKey,
    } as TransactionOutput);

    const tx = new Transaction({
      txInputs: [txIn],
      txOutputs: [txOut],
    } as Transaction);

    const txFee = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          amount: 1,
          toAddress: allice.publicKey,
        } as TransactionOutput),
      ],
    } as Transaction);

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [tx, txFee],
    } as Block);

    block.mine(exempleDifficulty, allice.publicKey);

    return block;
  }

  test("Shuld be valid", () => {
    const block = getFullBlock();

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (different hash)", () => {
    const block = getFullBlock();

    block.hash = "abc";

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (no fee)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          txInputs: [new TransactionInput()],
        } as Transaction),
      ],
    } as Block);

    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld create from block info", () => {
    const block = Block.fromBlockInfo({
      transactions: [],
      difficulty: exempleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);

    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          toAddress: allice.publicKey,
          amount: 1,
        } as TransactionOutput),
      ],
    } as Transaction);

    block.transactions.push(tx);

    block.hash = block.getHash();

    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeTruthy();
  });

  test("Shuld not be valid (2 FEE)", () => {
    const block = getFullBlock();
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput()],
    } as Transaction);
    tx.txInputs = undefined;
    block.transactions.push(tx);
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (invalid tx)", () => {
    const block = getFullBlock();
    block.transactions[0].timestamp = -1;
    block.hash = block.getHash();
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld not be valid (fallbacks)", () => {
    const block = new Block();
    block.transactions.push(
      new Transaction({
        type: TransactionType.FEE,
        txOutputs: [new TransactionOutput()],
      } as Transaction)
    );

    block.hash = block.getHash();

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid previous hash)", () => {
    const block = getFullBlock();
    block.previousHash = "abdsc";
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid timestamp)", () => {
    const block = getFullBlock();
    block.timestamp = -1;
    block.mine(exempleDifficulty, allice.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (empty hash)", () => {
    const block = getFullBlock();
    block.hash = "";

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (no mined)", () => {
    const block = getFullBlock();
    block.nonce = 0;

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });

  test("Shuld Not be valid (invalid index)", () => {
    const block = getFullBlock();
    block.index = -1;

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      exempleDifficulty,
      exempleFee
    );
    expect(valid.success).toBeFalsy();
  });
});
