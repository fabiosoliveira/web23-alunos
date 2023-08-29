import express, { Request, Response } from "express";
import morgan from "morgan";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import errorMiddleware from "./middlewares/errorMiddleware";

const app = express();

app.use(morgan("tiny"));
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json());

app.use("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use(errorMiddleware);

export default app;
