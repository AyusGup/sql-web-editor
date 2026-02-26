import { bullmqRedis } from "./config/redis";
import { pool } from "./config/postgres";
import { Worker } from "bullmq";

const worker = new Worker(
  "sandbox-cleanup",
  async (job) => {
    const { schema } = job.data;

    if (!schema || !schema.startsWith("workspace_")) {
      throw new Error("Invalid schema name");
    }

    console.log("Dropping schema:", schema);

    await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  },
  { connection: bullmqRedis }
);

worker.on("completed", (job) => {
  console.log("Cleanup completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("Cleanup failed:", job?.id, err);
});

// graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Worker shutting down...");
  await worker.close();
});