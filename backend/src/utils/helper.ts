import { TTL } from "../shared/constants";
import { cleanupQueue } from "../queue/cleanup.queue";


export function getKey(userId: string, assignmentId: string) {
  return `sandbox:${userId}:${assignmentId}`;
}

export function getSchema(userId: string, assignmentId: string) {
  return `workspace_${userId}_${assignmentId}`;
}

export async function scheduleCleanup(schema: string, userId: string, assignmentId: string){
  await cleanupQueue.add(
    "cleanup",
    { schema },
    {
      delay: TTL + 2000,
      removeOnComplete: true,
      jobId: `cleanup:${userId}:${assignmentId}`,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
}