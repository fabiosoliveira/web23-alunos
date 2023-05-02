import { describe, expect, test } from "vitest";
import request from "supertest";
import { app } from "../src/server/blockchainServer";
import Block from "./__mocks__/Block";

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

  test("GET /blocks/:hash - Shuld get block", async () => {
    const response = await request(app).get("/blocks/abc");

    expect(response.status).toEqual(200);
    expect(response.body.hash).toEqual("abc");
  });

  test("GET /blocks/:index - Shuld not get block", async () => {
    const response = await request(app).get("/blocks/-1");

    expect(response.status).toEqual(404);
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
});
