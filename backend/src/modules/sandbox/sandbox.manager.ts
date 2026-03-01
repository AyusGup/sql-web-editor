import { getRedis } from "../../db/config/redis";
import { adminPool } from "../../db/config/postgres";
import { seedSandbox } from "./sandbox.seeder";
import { executeSandboxQuery } from "./sandbox.executor";
import { TTL } from "../../shared/constants";
import { getKey, getSchema } from "../../utils/helper";
import { cleanupQueue } from "../queue/cleanup.queue";
import { MAX_RETRIES } from "../../shared/constants";



export async function executeInSandbox(
  userId: string,
  assignmentId: string,
  query: string,
  retryCount = 0
): Promise<Record<string, unknown>[]> {
  const redis = getRedis();
  const key = getKey(userId, assignmentId);
  const schema = getSchema(userId, assignmentId);

  // Check Cache
  const cached = await redis.get(key);

  if (cached) {
    // Cache HIT → Execute Query
    return executeAndManageJob(schema, query, key, userId, assignmentId, retryCount);
  }

  // Cache MISS → DB Lookup for Schema 
  const client = await adminPool.connect();

  try {
    const exists = await client.query(
      `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`,
      [schema]
    );

    if (exists.rowCount && exists.rowCount > 0) {
      // Schema exists in DB → Execute Query 
      // Set in cache first since we found it
      await redis.set(key, schema, { EX: TTL });
      return executeAndManageJob(schema, query, key, userId, assignmentId, retryCount);
    }
  } finally {
    client.release();
  }

  // Schema NOT found → Create Schema
  await createSchema(schema, assignmentId, key);

  // Execute Query on the newly created schema
  return executeAndManageJob(schema, query, key, userId, assignmentId, retryCount);
}

async function createSchema(
  schema: string,
  assignmentId: string,
  cacheKey: string
) {
  const redis = getRedis();

  // Lock to prevent race
  const lockKey = `lock:${cacheKey}`;
  const locked = await redis.set(lockKey, "1", { NX: true, EX: 10 });

  if (!locked) {
    // Another process is creating this schema, wait and let the caller retry
    await new Promise((r) => setTimeout(r, 300));
    // Check if schema was created by now
    const client = await adminPool.connect();
    try {
      const exists = await client.query(
        `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`,
        [schema]
      );
      if (exists.rowCount && exists.rowCount > 0) {
        await redis.set(cacheKey, schema, { EX: TTL });
        return; // Schema was created by the other process
      }
    } finally {
      client.release();
    }
    throw new Error("Schema creation in progress, please retry");
  }

  const client = await adminPool.connect();

  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await seedSandbox(client, assignmentId, schema);

    // Grant the runner user access ONLY to this specific temporary schema
    await client.query(`GRANT USAGE ON SCHEMA ${schema} TO read_write_runner`);
    await client.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schema} TO read_write_runner`
    );
  } finally {
    client.release();
    await redis.del(lockKey);
  }

  // Set schema state in cache
  await redis.set(cacheKey, schema, { EX: TTL });
}

/**
 * Executes the query, then manages the delayed cleanup job.
 * On failure, detects "schema not found" and retries after cache removal.
 */
async function executeAndManageJob(
  schema: string,
  query: string,
  cacheKey: string,
  userId: string,
  assignmentId: string,
  retryCount: number
): Promise<Record<string, unknown>[]> {
  const redis = getRedis();

  try {
    // Execute Query
    const rows = await executeSandboxQuery(schema, query);

    // Query PASSED → Manage delayed cleanup job 
    await manageCleanupJob(schema, userId, assignmentId);

    // Set schema state in cache (refresh TTL)
    await redis.expire(cacheKey, TTL);

    return rows;
  } catch (err: any) {
    // Query FAILED → Is it "Schema not found"?
    if (isSchemaNotFound(err)) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error(
          "Sandbox schema could not be restored after multiple retries"
        );
      }

      // YES → Remove Cache
      await redis.del(cacheKey);

      // Retry Process Again
      return executeInSandbox(userId, assignmentId, query, retryCount + 1);
    }

    throw err;
  }
}

function isSchemaNotFound(err: any): boolean {
  const msg = (err.message || "").toLowerCase();
  // PostgreSQL error code 3F000 = invalid_schema_name
  // PostgreSQL error code 42P01 = undefined_table (table doesn't exist, implying schema is gone)
  return (
    err.code === "3F000" ||
    err.code === "42P01" ||
    msg.includes("schema") && msg.includes("does not exist") ||
    msg.includes("relation") && msg.includes("does not exist")
  );
}

async function manageCleanupJob(
  schema: string,
  userId: string,
  assignmentId: string
) {
  const jobId = `cleanup:${userId}:${assignmentId}`;
  const delay = TTL * 1000;

  const existing = await cleanupQueue.getJob(jobId);

  if (existing) {
    const state = await existing.getState();

    if (state === "delayed") {
      // State: delay → Reschedule Job
      await existing.changeDelay(delay);
    }
    else {
      // If the job is active, failed, or completed, CANNOT update it.
      // fallback to the remove + add pattern here.
      await existing.remove();
      await scheduleNewCleanupJob(schema, jobId, delay);
    }
  } else {
    await scheduleNewCleanupJob(schema, jobId, delay);
  }
}

async function scheduleNewCleanupJob(schema: string, jobId: string, delay: number) {
  await cleanupQueue.add(
    "cleanup",
    { schema },
    {
      delay,
      jobId,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    }
  );
}


export async function resetSandbox(userId: string, assignmentId: string) {
  const redis = getRedis();
  const schema = getSchema(userId, assignmentId);

  const client = await adminPool.connect();

  try {
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  } finally {
    client.release();
  }

  await redis.del(getKey(userId, assignmentId));
}