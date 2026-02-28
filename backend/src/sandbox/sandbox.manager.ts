import { getRedis } from "../db/config/redis";
import { adminPool } from "../db/config/postgres";
import { seedSandbox } from "./sandbox.seeder";
import { TTL } from "../shared/constants";
import { getKey, getSchema, scheduleCleanup } from "../utils/helper";


export async function getOrCreateSandbox(
  userId: string,
  assignmentId: string
) {
  const redis = getRedis();
  const key = getKey(userId, assignmentId);
  const schema = getSchema(userId, assignmentId);

  const cached = await redis.get(key);

  if (cached) {
    await redis.expire(key, TTL);

    await scheduleCleanup(schema, userId, assignmentId);

    return { schema };
  }

  // Cache miss
  let client = await adminPool.connect();

  try {
    const exists = await client.query(
      `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`,
      [schema]
    );

    if (exists.rowCount && exists.rowCount > 0) {
      // restore session
      await redis.set(key, schema, { EX: TTL });

      await scheduleCleanup(schema, userId, assignmentId);

      return { schema };
    }
  } finally {
    client.release();
  }

  // ---- lock to prevent race ----
  const lockKey = `lock:${key}`;
  const locked = await redis.set(lockKey, "1", { NX: true, EX: 10 });

  if (!locked) {
    // wait briefly and retry
    await new Promise((r) => setTimeout(r, 200));
    return getOrCreateSandbox(userId, assignmentId);
  }

  client = await adminPool.connect();

  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await seedSandbox(client, assignmentId, schema);

    // Grant the runner user access ONLY to this specific temporary schema
    await client.query(`GRANT USAGE ON SCHEMA ${schema} TO read_write_runner`);
    await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schema} TO read_write_runner`);
  } finally {
    client.release();
    await redis.del(lockKey);
  }

  await redis.set(key, schema, { EX: TTL });

  await scheduleCleanup(schema, userId, assignmentId);

  return { schema };
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