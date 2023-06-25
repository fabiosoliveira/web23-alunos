import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import morgan from "morgan";
import { minAndTransfer } from "./Web3Provider";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan("tiny"));

app.post("/mint/:wallet", async (req: Request, res: Response) => {
  try {
    const tx = await minAndTransfer(req.params.wallet);
    res.json(tx);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
