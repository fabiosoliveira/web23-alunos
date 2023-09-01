import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded) {
      res.locals.token = decoded;
      return next();
    }
  } catch (error) {
    console.error(error);
  }
  return res.sendStatus(401);
};
