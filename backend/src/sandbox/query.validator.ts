export function validateQuery(query: string) {
  let normalized = query.trim().toLowerCase();

  // Remove SQL comments
  normalized = normalized.replace(/--.*$/gm, "");

  // Allow one trailing semicolon
  if (normalized.endsWith(";")) {
    normalized = normalized.slice(0, -1);
  }

  // Prevent multiple queries
  if (normalized.includes(";")) {
    throw new Error("Multiple queries not allowed");
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
  ];

  const allowed = ["select", "with"];

  const firstWord = normalized.split(/\s+/)[0];
  if (!allowed.includes(firstWord)) {
    throw new Error("Only SELECT queries allowed");
  }

  for (const word of forbidden) {
    if (normalized.includes(word)) {
      throw new Error(`Forbidden keyword detected: ${word}`);
    }
  }
}