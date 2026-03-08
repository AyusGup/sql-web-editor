export function validateQuery(query: string) {
  let normalized = query.trim();

  // Enforce that the student manually provides a trailing semicolon
  if (!normalized.endsWith(";")) {
    throw new Error("Query must end with a semicolon (;)");
  }

  normalized = normalized.toLowerCase().replace(/--.*$/gm, "");

  // Strip the trailing semicolon strictly for internal array mapping and pg compatibility if needed.
  if (normalized.endsWith(";")) {
    normalized = normalized.slice(0, -1);
  }

  const forbidden = [
    "commit",
    "rollback",
    "begin",
    "savepoint",
    "drop",
    "alter",
    "truncate",
    "grant",
    "revoke",
    "set ",
    "reset",
    "create",
    "vacuum"
  ];

  const allowed = ["select", "with", "insert", "update", "delete"];

  const firstWord = normalized.split(/\s+/)[0];
  if (!allowed.includes(firstWord)) {
    throw new Error("Query must start with SELECT, WITH, INSERT, UPDATE, or DELETE");
  }

  for (const word of forbidden) {
    if (normalized.includes(word)) {
      throw new Error(`Forbidden keyword detected: ${word}`);
    }
  }
}