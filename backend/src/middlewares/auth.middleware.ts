import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/schema";


export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Please log in to access this resource" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Session expired or invalid" });
  }
};