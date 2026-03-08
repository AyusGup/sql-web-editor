import { Pool } from "pg";

let runnerPool: Pool;

export function initPostgres() {
  const {
    POSTGRES_HOST,
    RUNNER_USER,
    RUNNER_PASSWORD,
    POSTGRES_DB_NAME,
    POSTGRES_PORT,
  } = process.env;

  if (
    !RUNNER_USER ||
    !RUNNER_PASSWORD ||
    !POSTGRES_DB_NAME ||
    !POSTGRES_HOST ||
    !POSTGRES_PORT
  ) {
    throw new Error("DB environment variables are undefined");
  }

  runnerPool = new Pool({
    host: POSTGRES_HOST,
    user: RUNNER_USER,
    password: RUNNER_PASSWORD,
    database: POSTGRES_DB_NAME,
    port: Number(POSTGRES_PORT),
    ssl: false,
    max: 17,
    min: 2,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });
}

export function getRunnerPool() {
  if (!runnerPool) {
    throw new Error("Runner Postgres not initialized");
  }
  return runnerPool;
}