import Assignment from "../../db/models/Assignment";
import AssignmentTestcase from "../../db/models/AssignmentTestcase";
import Testcase from "../../db/models/Testcase";
import UserProgress from "../../db/models/UserProgress";

export async function getAssignments({
  page = 1,
  limit = 10,
  difficulty,
  tags,
  userId,
}: {
  page?: number;
  limit?: number;
  difficulty?: string;
  tags?: string[];
  userId?: string;
}) {
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (difficulty) filter.difficulty = difficulty;
  if (tags?.length) filter.tags = { $in: tags };

  const [data, total] = await Promise.all([
    Assignment.find(filter)
      .select("_id title difficulty tags createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Assignment.countDocuments(filter),
  ]);

  let finalData: any[] = data;
  if (userId) {
    const progress = await UserProgress.find({
      userId,
      assignmentId: { $in: data.map((a) => a._id) },
      isCompleted: true,
    })
      .select("assignmentId")
      .lean();

    const completedIds = new Set(progress.map((p) => p.assignmentId.toString()));
    finalData = data.map((a) => ({
      ...a,
      isCompleted: completedIds.has(a._id.toString()),
    }));
  }

  return {
    data: finalData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetch testcases for an assignment. Optionally filter by visibility.
 */
export async function getTestcasesForAssignment(assignmentId: string, visibleOnly = false) {
  const links = await AssignmentTestcase.find({ assignmentId }).lean();
  const testcaseIds = links.map((l) => l.testcaseId);

  const query: any = { _id: { $in: testcaseIds } };
  if (visibleOnly) {
    query.visible = true;
  }

  return Testcase.find(query)
    .select("_id sampleTables expectedOutput visible")
    .lean();
}

/**
 * Kept for backward compatibility or direct use if needed.
 */
export async function getAssignmentById(id: string) {
  const assignment = await Assignment.findById(id).lean();

  if (!assignment) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }

  const testcases = await getTestcasesForAssignment(id, true);

  return { ...assignment, testcases };
}

/**
 * Kept specifically for sandbox to get everything.
 */
export async function getAllTestcasesForAssignment(assignmentId: string) {
  return getTestcasesForAssignment(assignmentId, false);
}