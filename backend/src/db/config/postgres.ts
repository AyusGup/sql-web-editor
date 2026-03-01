import { Pool } from "pg";


const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB_NAME,
  POSTGRES_PORT,
  RUNNER_USER,
  RUNNER_PASSWORD,
} = process.env;

if (
  !POSTGRES_USER ||
  !POSTGRES_PASSWORD ||
  !POSTGRES_DB_NAME ||
  !POSTGRES_HOST ||
  !POSTGRES_PORT
) {
  throw new Error("DB environment variables are undefined");
}

const ssl = process.env.NODE_ENV === "test" ? false : { rejectUnauthorized: false };

const adminPool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB_NAME,
  port: Number(POSTGRES_PORT),
  ssl: ssl,
  max: 3,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

const runnerPool = new Pool({
  host: POSTGRES_HOST,
  user: RUNNER_USER,
  password: RUNNER_PASSWORD,
  database: POSTGRES_DB_NAME,
  port: Number(POSTGRES_PORT),
  ssl: ssl,
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

export { adminPool, runnerPool };