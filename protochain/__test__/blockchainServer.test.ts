import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import { app } from "../src/server/blockchainServer";
import Block from "../src/lib/Block";
import Transaction from "../src/lib/Transaction";
import TransactionInput from "../src/lib/TransactionInput";
import TransactionOutput from "../src/lib/TransactionOutput";

vi.mock("../src/lib/Block");
vi.mock("../src/lib/Blockchain");
vi.mock("../src/lib/Transaction");
vi.mock("../src/lib/TransactionInput");
vi.mock("../src/lib/TransactionOutput");

describe("BlockchainServer tests", () => {
  test("GET /status - Should return status", async () => {
    const response = await request(app).get("/status");

    expect(response.status).toEqual(200);
    expect(response.body.isValid.success).toEqual(true);
  });

  test("GET /blocks/:indexOrHash - Shuld get genesis", async () => {
    const response = await request(app).get("/blocks/0");

    expect(response.status).toEqual(200);
    expect(response.body.index).toEqual(0);
  });

  // test("GET /blocks/:hash - Shuld get block", async () => {
  //   const response = await request(app).get("/blocks/abc");

  //   expect(response.status).toEqual(200);
  //   expect(response.body.hash).toEqual("abc");
  // });

  test("GET /blocks/:index - Shuld not get block", async () => {
    const response = await request(app).get("/blocks/-1");

    expect(response.status).toEqual(404);
  });

  test("GET /blocks/next - Shuld get next block info", async () => {
    const response = await request(app).get("/blocks/next");

    expect(response.status).toEqual(200);
    expect(response.body.index).toEqual(1);
  });

  test("POST /blocks/ - Shuld add block", async () => {
    const block = new Block({ index: 1 } as Block);
    const response = await request(app).post("/blocks/").send(block);

    expect(response.status).toEqual(201);
    expect(response.body.index).toEqual(1);
  });

  test("POST /blocks/ - Shuld not add block (empty)", async () => {
    const response = await request(app).post("/blocks/").send({});

    expect(response.status).toEqual(422);
  });

  test("POST /blocks/ - Shuld not add block (invalid)", async () => {
    const block = new Block({ index: -1 } as Block);
    const response = await request(app).post("/blocks/").send(block);

    expect(response.status).toEqual(400);
  });

  test("GET /transactions/:hash - Shuld get transaction abc", async () => {
    const response = await request(app).get("/transactions/abc");

    expect(response.status).toEqual(200);
    expect(response.body.mempoolIndex).toEqual(0);
  });

  // test("GET /transactions - Shuld get transactions", async () => {
  //   const response = await request(app).get("/transactions");

  //   expect(response.status).toEqual(200);
  //   expect(response.body.total).toEqual(0);
  // });

  test("POST /transactions/ - Shuld add tx", async () => {
    const tx = new Transaction({
      txInputs: [new TransactionInput()],
      txOutputs: [new TransactionOutput()],
    } as Transaction);

    const response = await request(app).post("/transactions/").send(tx);

    expect(response.status).toEqual(201);
  });

  // test("POST /transactions/ - Shuld not add empty", async () => {
  //   const txInputs = [new TransactionInput()];
  //   txInputs[0].amount = -1;

  //   const tx = new Transaction({
  //     txInputs,
  //   } as Transaction);

  //   const response = await request(app).post("/transactions/").send(tx);

  //   expect(response.status).toEqual(400);
  // });

  // test("POST /transactions/ - Shuld not add undefined hash", async () => {
  //   const txInputs = [new TransactionInput()];
  //   txInputs[0].amount = -1;

  //   const tx = {
  //     txInputs,
  //   } as Transaction;

  //   const response = await request(app).post("/transactions/").send(tx);

  //   expect(response.status).toEqual(422);
  // });
});
