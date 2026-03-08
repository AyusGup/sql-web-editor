import { PoolClient } from "pg";
import { ISampleTable } from "../../types/schema";

export async function seedSandbox(
  client: PoolClient,
  sampleTables: ISampleTable[]
) {
  for (const table of sampleTables) {
    const columns = table.columns
      .map((col) => `"${col.columnName}" ${col.dataType}`)
      .join(", ");

    await client.query(`CREATE TEMP TABLE "${table.tableName}" (${columns}) ON COMMIT DROP;`);

    // Seed Data if present
    const rows = table.rows;
    if (rows && rows.length > 0) {
      const insertColumns = table.columns.map(c => `"${c.columnName}"`).join(", ");
      const valuesStatements = rows.map((row) => {
        const rowValues = table.columns.map((col) => {
          const val = row[col.columnName];
          if (val === null || val === undefined) return "NULL";
          if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
          if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
          return val;
        });
        return `(${rowValues.join(", ")})`;
      });

      // Batch Insert
      const insertQuery = `INSERT INTO "${table.tableName}" (${insertColumns}) VALUES ${valuesStatements.join(", ")};`;
      await client.query(insertQuery);
    }
  }
}