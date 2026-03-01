import { bullmqRedis } from "./config/redis";
import { pool } from "./config/postgres";
import { Worker } from "bullmq";
import logger from "./config/logger";
import { startLogCleanupCron } from "./log-cleanup";

const worker = new Worker(
  "sandbox-cleanup",
  async (job) => {
    const { schema } = job.data;

    if (!schema || !schema.startsWith("workspace_")) {
      throw new Error("Invalid schema name");
    }

    logger.info("Dropping schema: %s", schema);

    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  },
  {
    connection: bullmqRedis,
    concurrency: 3,             // process up to 3 cleanup jobs at once (I/O bound, safe)
    lockDuration: 30000,        // 30s lock — DROP SCHEMA is fast
    stalledInterval: 30000,     // check for stalled jobs every 30s
    maxStalledCount: 2,         // allow 1 retry if stalled, then fail
    removeOnComplete: {
      count: 50,                // keep last 50 completed jobs for debugging
    },
    removeOnFail: {
      count: 200,               // keep last 200 failed jobs for inspection
      age: 7 * 24 * 3600,       // remove failed jobs older than 7 days
    },
  }
);

worker.on("completed", (job) => {
  logger.info("Cleanup completed: %s", job.id);
});

worker.on("failed", (job, err) => {
  logger.error("Cleanup failed: %s — %s", job?.id, err.message);
});

worker.on("stalled", (jobId) => {
  logger.warn("Job stalled: %s", jobId);
});

worker.on("error", (err) => {
  logger.error("Worker error: %s", err.message);
});

// graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Worker shutting down...");
  await worker.close();
});

// Start the monthly log cleanup cron
startLogCleanupCron();

logger.info("Worker started.");