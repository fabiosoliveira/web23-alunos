import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"] as string;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(err);
      return res.sendStatus(401);
    }

    if (decoded) {
      res.locals.token = decoded;
      return next();
    }
  });
};
