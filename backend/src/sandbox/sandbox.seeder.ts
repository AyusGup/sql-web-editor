import Assignment from "../db/models/Assignment";
import { PoolClient } from "pg";

export async function seedSandbox(
  client: PoolClient,
  assignmentId: string,
  schema: string
) {
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new Error("Assignment not found");

  for (const table of assignment.sampleTables) {
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