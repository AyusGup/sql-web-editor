import { getRedis } from "../db/config/redis";
import { pool } from "../db/config/postgres";
import { seedSandbox } from "./sandbox.seeder";
import { TTL } from "../shared/constants";


function getKey(userId: string, assignmentId: string) {
  return `sandbox:${userId}:${assignmentId}`;
}

function getSchema(userId: string, assignmentId: string) {
  return `workspace_${userId}_${assignmentId}`;
}

export async function getOrCreateSandbox(
  userId: string,
  assignmentId: string
) {
  const redis = getRedis();
  const key = getKey(userId, assignmentId);

  let sandbox = await redis.get(key);

  if (sandbox) {
    await redis.expire(key, TTL);
    return JSON.parse(sandbox);
  }

  const schema = getSchema(userId, assignmentId);

  const client = await pool.connect();
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await seedSandbox(client, assignmentId, schema);
  } finally {
    client.release();
  }

  const data = { schema };

  await redis.set(key, JSON.stringify(data), { EX: TTL });

  return data;
}

export async function resetSandbox(userId: string, assignmentId: string) {
  const redis = getRedis();
  const schema = getSchema(userId, assignmentId);

  const client = await pool.connect();

  try {
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  } finally {
    client.release();
  }

  await redis.del(getKey(userId, assignmentId));
}