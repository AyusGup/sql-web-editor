import { Request, Response, NextFunction } from "express";
import { getRedis } from "../db/config/redis";
import { WINDOW, USER_LIMIT, GLOBAL_LIMIT } from "../shared/constants";
import { slidingLimiter } from "../utils/helper";
import { responseHandler } from "../shared/response";


export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const redis = getRedis();

  const userId = "anon";

  const userAllowed = await slidingLimiter(
    redis,
    `rate:user:${userId}`,
    USER_LIMIT,
    WINDOW
  );

  if (!userAllowed) {
    return responseHandler(res, false, 429, "Too many requests", "", "USER_RATE_LIMIT");
  }

  const globalAllowed = await slidingLimiter(
    redis,
    "rate:global",
    GLOBAL_LIMIT,
    WINDOW
  );

  if (!globalAllowed) {
    return responseHandler(res, false, 429, "Too many requests", "", "GLOBAL_RATE_LIMIT");
  }

  next();
}