import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) =>
      console.error("Redis error:", err)
    );

    await redisClient.connect();
    console.log("Redis connected");
  }

  return redisClient;
}

export function getRedis() {
  if (!redisClient) {
    throw new Error("Redis not initialized");
  }
  return redisClient;
}