import { runnerPool } from "../db/config/postgres";

export async function executeSandboxQuery(
  schema: string,
  query: string
) {
  const client = await runnerPool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO ${schema}`);

    const result = await client.query(query);

    await client.query("ROLLBACK");

    return result.rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}