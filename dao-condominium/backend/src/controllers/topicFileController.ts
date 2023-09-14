import { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { keccak256 } from "ethers";

async function getTopicFile(req: Request, res: Response) {
  return res.sendStatus(200);
}

async function getTopicFiles(req: Request, res: Response) {
  return res.sendStatus(200);
}

async function addTopicFile(req: Request, res: Response) {
  return res.sendStatus(201);
}

async function deleteTopicFile(req: Request, res: Response) {
  return res.sendStatus(204);
}

async function deleteAllTopicFiles(req: Request, res: Response) {
  return res.sendStatus(204);
}

export default {
  getTopicFile,
  getTopicFiles,
  addTopicFile,
  deleteTopicFile,
  deleteAllTopicFiles,
};
