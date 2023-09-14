import { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { keccak256, toUtf8Bytes } from "ethers";

function checkTitleOrHash(hashOrTitle: string) {
  if (!hashOrTitle) throw new Error("The hash or title is required.");

  const regex = /^[0-9a-f]{64}$/gi;
  if (!regex.test(hashOrTitle)) {
    return keccak256(toUtf8Bytes(hashOrTitle));
  }

  return hashOrTitle;
}

async function getTopicFile(req: Request, res: Response) {
  const hash = checkTitleOrHash(req.params.hash);
  const fileName = req.params.fileName;
  const filePath = path.resolve(__dirname, "..", "..", "files", hash, fileName);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);

  return res.download(filePath);
}

async function getTopicFiles(req: Request, res: Response) {
  const hash = checkTitleOrHash(req.params.hash);
  const folder = path.resolve(__dirname, "..", "..", "files", hash);

  if (fs.existsSync(folder)) {
    const files = await fs.promises.readdir(folder);
    return res.json(files);
  }

  return res.json([]);
}

async function addTopicFile(req: Request, res: Response, next: NextFunction) {
  const hash = checkTitleOrHash(req.params.hash);
  const file = req.file;

  if (!file) return next(new Error("No file found."));

  const folder = path.resolve(__dirname, "..", "..", "files");
  const oldPath = path.join(folder, file.filename);

  const newfolder = path.join(folder, hash);
  if (!fs.existsSync(newfolder)) {
    await fs.promises.mkdir(newfolder);
  }

  const newPath = path.join(newfolder, file.originalname);
  await fs.promises.rename(oldPath, newPath);

  return res.sendStatus(201);
}

async function deleteTopicFile(req: Request, res: Response) {
  const hash = checkTitleOrHash(req.params.hash);
  const fileName = req.params.fileName;
  const filePath = path.resolve(__dirname, "..", "..", "files", hash, fileName);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);

  await fs.promises.unlink(filePath);

  return res.sendStatus(204);
}

async function deleteAllTopicFiles(req: Request, res: Response) {
  const hash = checkTitleOrHash(req.params.hash);
  const folder = path.resolve(__dirname, "..", "..", "files", hash);
  const files = await fs.promises.readdir(folder);
  const promiseFiles = files.map((file) =>
    fs.promises.unlink(path.join(folder, file))
  );
  await Promise.all(promiseFiles);

  await fs.promises.rmdir(folder);

  return res.sendStatus(204);
}

export default {
  getTopicFile,
  getTopicFiles,
  addTopicFile,
  deleteTopicFile,
  deleteAllTopicFiles,
};
