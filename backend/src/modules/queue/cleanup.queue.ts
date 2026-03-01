import { Queue } from "bullmq";
import { bullmqRedis } from "../../db/config/bullmqRedis";

export const cleanupQueue = new Queue("sandbox-cleanup", {
  connection: bullmqRedis,
});