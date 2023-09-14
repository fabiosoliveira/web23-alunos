import express, { Request, Response } from "express";
import morgan from "morgan";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import errorMiddleware from "./middlewares/errorMiddleware";
import authenticationMiddleware from "./middlewares/authenticationMiddleware";
import residentRouter from "./routers/residentRouter";
import authController from "./controllers/authController";

const app = express();

app.use(morgan("tiny"));
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json());

app.post("/login/", authController.doLogin);
app.use("/residents/", authenticationMiddleware, residentRouter);

app.use("/", (req: Request, res: Response) => {
  res.send("Health check");
});

app.use(errorMiddleware);

export default app;