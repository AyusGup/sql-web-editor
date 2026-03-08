import { Pool } from "pg";

let adminPool: Pool;
let runnerPool: Pool;

export function initPostgres() {
  const {
    POSTGRES_HOST,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    RUNNER_USER,
    RUNNER_PASSWORD,
    POSTGRES_DB_NAME,
    POSTGRES_PORT,
  } = process.env;

  if (
    !POSTGRES_USER ||
    !POSTGRES_PASSWORD ||
    !RUNNER_USER ||
    !RUNNER_PASSWORD ||
    !POSTGRES_DB_NAME ||
    !POSTGRES_HOST ||
    !POSTGRES_PORT
  ) {
    throw new Error("DB environment variables are undefined");
  }

  adminPool = new Pool({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB_NAME,
    port: Number(POSTGRES_PORT),
    ssl: false,
    max: 3,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });

  runnerPool = new Pool({
    host: POSTGRES_HOST,
    user: RUNNER_USER,
    password: RUNNER_PASSWORD,
    database: POSTGRES_DB_NAME,
    port: Number(POSTGRES_PORT),
    ssl: false,
    max: 5,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });
}

export function getAdminPool() {
  if (!adminPool) {
    throw new Error("Admin Postgres not initialized");
  }
  return adminPool;
}

export function getRunnerPool() {
  if (!runnerPool) {
    throw new Error("Runner Postgres not initialized");
  }
  return runnerPool;
}