import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { minAndTransfer } from "./web3Provider";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(helmet());
app.use(morgan("tiny"));
app.use(cors({ origin: process.env.CORS_ORIGINS || "*" }));
app.use(checkNextMint);

const nextMint = new Map<string, number>();

function checkNextMint(req: Request, res: Response, next: NextFunction) {
  const wallet = req.params.wallet;

  if (nextMint.has(wallet) && nextMint.get(wallet)! > Date.now()) {
    return res.status(400).send({ error: "Try again tomorrow." });
  }

  next();

  nextMint.set(wallet, Date.now() + 1000 * 60 * 60 * 24);
}

app.post("/mint/:wallet", async (req: Request, res: Response) => {
  const wallet = req.params.wallet;

  try {
    const tx = await minAndTransfer(wallet);
    res.json(tx);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
