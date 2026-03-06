import { Request, Response, NextFunction } from "express";
import { getRedis } from "../db/config/redis";
import { WINDOW, RATE_LIMITS } from "../shared/constants";
import { slidingLimiter } from "../utils/helper";
import { responseHandler } from "../shared/response";


export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const redis = getRedis();

  const userId = "anon";

  const userAllowed = await slidingLimiter(
    redis,
    `rate:user:${userId}`,
    RATE_LIMITS.USER,
    WINDOW
  );

  if (!userAllowed) {
    return responseHandler(res, false, 429, "Too many requests", "", "USER_RATE_LIMIT");
  }

  const globalAllowed = await slidingLimiter(
    redis,
    "rate:global",
    RATE_LIMITS.GLOBAL,
    WINDOW
  );

  if (!globalAllowed) {
    return responseHandler(res, false, 429, "Too many requests", "", "GLOBAL_RATE_LIMIT");
  }

  next();
}