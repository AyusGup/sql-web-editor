export function gradeResult(userRows: any[], expected: any) {
  if (!expected) {
    return { correct: false, reason: "No expected output" };
  }

  if (expected.type === "table") {
    return gradeTable(userRows, expected.value);
  }

  if (expected.type === "single_value") {
    const val = userRows[0] ? Object.values(userRows[0])[0] : null;
    return {
      correct: val === expected.value,
      expected: expected.value,
      got: val,
    };
  }

  if (expected.type === "count") {
    return {
      correct: userRows.length === expected.value,
      expected: expected.value,
      got: userRows.length,
    };
  }

  return { correct: false, reason: "Unsupported grading" };
}

function gradeTable(userRows: any[], expectedRows: any[]) {
  if (userRows.length !== expectedRows.length) {
    return {
      correct: false,
      reason: "Row count mismatch",
    };
  }

  // Normalize order
  const normalize = (rows: any[]) =>
    rows.map((r) => JSON.stringify(r)).sort();

  const user = normalize(userRows);
  const expected = normalize(expectedRows);

  const correct = user.every((v, i) => v === expected[i]);

  return {
    correct,
    expected: expectedRows,
    got: userRows,
  };
}