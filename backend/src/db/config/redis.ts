import { createClient } from "redis";
import logger from "../../shared/logger";

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) =>
      logger.error("Redis error: %s", err.message)
    );

    await redisClient.connect();
    logger.info("Redis connected");
  }

  return redisClient;
}

export function getRedis() {
  if (!redisClient) {
    throw new Error("Redis not initialized");
  }
  return redisClient;
}