import Assignment from "../db/models/Assignment";

export async function getAssignments({
  page = 1,
  limit = 10,
  difficulty,
  tags,
}: {
  page?: number;
  limit?: number;
  difficulty?: string;
  tags?: string[];
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

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAssignmentById(id: string) {
  const assignment = await Assignment.findById(id).lean();

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return assignment;
}