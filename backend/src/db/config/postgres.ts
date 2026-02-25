import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";


const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
  MAX_POOL_SIZE
} = process.env;

if (
  !POSTGRES_USER ||
  !POSTGRES_PASSWORD ||
  !POSTGRES_DB ||
  !POSTGRES_HOST ||
  !POSTGRES_PORT ||
  !MAX_POOL_SIZE
) {
  throw new Error("DB environment variables are undefined");
}

const ssl = process.env.NODE_ENV === "test" ? false : { rejectUnauthorized: false };

const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  port: Number(POSTGRES_PORT),
  ssl: ssl,
  max: Number(MAX_POOL_SIZE),
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

export const db = drizzle(pool);
export { pool };