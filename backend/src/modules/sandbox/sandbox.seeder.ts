import { PoolClient } from "pg";
import { ISampleTable } from "../../types/schema";

export async function seedSandbox(
  client: PoolClient,
  sampleTables: ISampleTable[],
  schema: string
) {
  for (const table of sampleTables) {
    const columns = table.columns
      .map((c: any) => `${c.columnName} ${c.dataType}`)
      .join(",");

    await client.query(
      `CREATE TABLE ${schema}.${table.tableName} (${columns});`
    );

    for (const row of table.rows) {
      const keys = Object.keys(row);
      const values = Object.values(row);

      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");

      await client.query(
        `INSERT INTO ${schema}.${table.tableName} (${keys.join(
          ","
        )}) VALUES (${placeholders})`,
        values
      );
    }
  }
}