import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import morgan from "morgan";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan("tiny"));

app.post("/mint/:wallet", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
