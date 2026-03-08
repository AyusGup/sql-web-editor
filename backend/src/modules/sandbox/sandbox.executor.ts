import { getRunnerPool } from "../../db/config/postgres";
import { seedSandbox } from "./sandbox.seeder";
import { ISampleTable } from "../../types/schema";
import * as appInsights from "applicationinsights";

export async function executeSandboxQuery(
  sampleTables: ISampleTable[],
  query: string
) {
  const telemetry = appInsights.defaultClient;
  const startTime = Date.now();

  // Track start of a sandbox query
  telemetry?.trackMetric({ name: 'ActiveSandboxQueries', value: 1 });

  const client = await getRunnerPool().connect();

  try {
    // 1. Begin Execution Transaction
    await client.query("BEGIN;");

    // 2. Lock the student query to ONLY their own Temporary tables
    await client.query("SET LOCAL search_path TO pg_temp;");

    // 3. Generate Temporary Tables and Seed Data
    await seedSandbox(client, sampleTables);

    // 4. Evaluate the user's query against their private Temp Tables
    const result = await client.query(query);

    // 5. Cleanly Rollback the transaction
    await client.query("ROLLBACK;");

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
    if (Array.isArray(result)) {
      const lastResult = result[result.length - 1];
      return lastResult.rows || [];
    }

    return result?.rows || [];
  } catch (err) {
    // 6. If the user query crashed, ensure rollback
    await client.query("ROLLBACK;");

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
    // 7. Magic Connection Reset: This physically enforces that no state bleeds between pooled clients
    try {
      await client.query("DISCARD ALL;");
    } catch (e) {
      console.error("Failed to DISCARD ALL on sandbox connection", e);
    }
    client.release();
    telemetry?.trackMetric({ name: 'ActiveSandboxQueries', value: -1 });
  }
}