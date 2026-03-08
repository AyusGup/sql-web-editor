import { getRunnerPool } from "../../db/config/postgres";
import * as appInsights from "applicationinsights";

export async function executeSandboxQuery(
  schema: string,
  query: string
) {
  const telemetry = appInsights.defaultClient;
  const startTime = Date.now();

  // Track start of a sandbox query
  telemetry?.trackMetric({ name: 'ActiveSandboxQueries', value: 1 });

  const client = await getRunnerPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO ${schema}`);

    const result = await client.query(query);

    await client.query("ROLLBACK");

    // Success Track: Dependency Duration
    telemetry?.trackDependency({
      target: 'PostgreSQL-Sandbox',
      name: 'ExecuteSandboxQuery',
      data: query.substring(0, 100),
      duration: Date.now() - startTime,
      resultCode: 0,
      success: true,
      dependencyTypeName: 'SQL'
    });

    // If multiple queries were sent, pg returns an array of result objects.
    // We return the rows from the LAST query executed.
    if (Array.isArray(result)) {
      const lastResult = result[result.length - 1];
      return lastResult.rows || [];
    }

    return result.rows;
  } catch (err) {
    await client.query("ROLLBACK");

    // Failure Track
    telemetry?.trackException({ exception: err as Error });
    telemetry?.trackDependency({
      target: 'PostgreSQL-Sandbox',
      name: 'ExecuteSandboxQuery',
      duration: Date.now() - startTime,
      success: false,
      dependencyTypeName: 'SQL'
    });

    throw err;
  } finally {
    client.release();
    telemetry?.trackMetric({ name: 'ActiveSandboxQueries', value: -1 });
  }
}