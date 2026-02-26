import { Pool } from "pg";


const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB_NAME,
  POSTGRES_PORT,
  MAX_POOL_SIZE
} = process.env;

if (
  !POSTGRES_USER ||
  !POSTGRES_PASSWORD ||
  !POSTGRES_DB_NAME ||
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
  database: POSTGRES_DB_NAME,
  port: Number(POSTGRES_PORT),
  ssl: ssl,
  max: Number(MAX_POOL_SIZE),
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

export { pool };