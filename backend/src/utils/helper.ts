import { TTL } from "../shared/constants";
import { cleanupQueue } from "../queue/cleanup.queue";


export function getKey(userId: string, assignmentId: string) {
  return `sandbox:${userId}:${assignmentId}`;
}

export function getSchema(userId: string, assignmentId: string) {
  return `workspace_${userId}_${assignmentId}`;
}

export async function scheduleCleanup(
  schema: string,
  userId: string,
  assignmentId: string
) {
  const jobId = `cleanup:${userId}:${assignmentId}`;

  // remove existing delayed job
  const existing = await cleanupQueue.getJob(jobId);
  if (existing) {
    await existing.remove();
  }

  await cleanupQueue.add(
    "cleanup",
    { schema },
    {
      delay: (TTL+ 2000) * 1000,
      jobId,
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
}

export function executionInfo(output: any) {
  // Query not executed
  if (!output) {
    return "The user has not executed the query yet.";
  }

  // Execution error (string case)
  if (typeof output === "string") {
    return `The query failed with error: ${output}`;
  }

  // Your grading system
  if (output.grading?.correct) {
    return "The query result is correct.";
  }

  const reason = output.grading?.reason ?? "Unknown issue";

  const rows = output.rows ?? [];

  if (rows.length === 0) {
    return `The query ran but returned no rows. Issue: ${reason}`;
  }

  return `
    The query executed but is incorrect.

    Issue: ${reason}

    Returned rows:
    ${JSON.stringify(rows.slice(0, 5))}`;
}