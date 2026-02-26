import { Redis } from "ioredis";

export const bullmqRedis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});