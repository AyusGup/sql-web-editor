import Assignment from "../../db/models/Assignment";
import Testcase from "../../db/models/Testcase";
import AssignmentTestcase from "../../db/models/AssignmentTestcase";
import User from "../../db/models/User";

export async function getAdminSummary() {
    const [totalUsers, totalAssignments, totalTestcases] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Assignment.countDocuments(),
        Testcase.countDocuments(),
    ]);

    return {
        totalUsers,
        totalAssignments,
        totalTestcases,
    };
}

export async function getAllAssignmentsAdmin() {
    return Assignment.find().sort({ createdAt: -1 }).lean();
}

export async function createAssignmentAdmin(data: any) {
    return Assignment.create(data);
}

export async function updateAssignmentAdmin(id: string, data: any) {
    return Assignment.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteAssignmentAdmin(id: string) {
    const [deleted] = await Promise.all([
        Assignment.findByIdAndDelete(id).lean(),
        AssignmentTestcase.deleteMany({ assignmentId: id }),
    ]);
    return deleted;
}

export async function getAllTestcasesAdmin() {
    return Testcase.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "assignmenttestcases",
                localField: "_id",
                foreignField: "testcaseId",
                as: "_links",
            },
        },
        {
            $lookup: {
                from: "assignments",
                localField: "_links.assignmentId",
                foreignField: "_id",
                as: "_assignments",
            },
        },
        {
            $addFields: {
                linkedAssignments: {
                    $map: {
                        input: "$_assignments",
                        as: "a",
                        in: { _id: "$$a._id", title: "$$a.title" },
                    },
                },
            },
        },
        { $project: { _links: 0, _assignments: 0 } },
    ]);
}

export async function createTestcaseAdmin(data: any) {
    return Testcase.create(data);
}

export async function updateTestcaseAdmin(id: string, data: any) {
    return Testcase.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteTestcaseAdmin(id: string) {
    const [deleted] = await Promise.all([
        Testcase.findByIdAndDelete(id).lean(),
        AssignmentTestcase.deleteMany({ testcaseId: id }),
    ]);
    return deleted;
}

export async function searchAssignmentsAdmin(query: string) {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim();

    // $text does word-based matching (ranked by relevance)
    const results = await Assignment.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" }, title: 1, difficulty: 1 }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(8)
        .lean();

    if (results.length > 0) return results;

    // Fallback: substring matching via regex 
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return Assignment.find(
        { title: { $regex: escaped, $options: "i" } },
        { title: 1, difficulty: 1 }
    )
        .limit(8)
        .lean();
}

export async function syncTestcaseLinks(testcaseId: string, assignmentIds: string[]) {
    const existing = await AssignmentTestcase.find({ testcaseId }).lean();
    const existingIds = new Set(existing.map((l) => l.assignmentId.toString()));
    const desiredIds = new Set(assignmentIds);

    const toAdd = assignmentIds.filter((id) => !existingIds.has(id));
    const toRemove = existing
        .filter((l) => !desiredIds.has(l.assignmentId.toString()))
        .map((l) => l._id);

    await Promise.all([
        toAdd.length > 0
            ? AssignmentTestcase.insertMany(
                toAdd.map((assignmentId) => ({ assignmentId, testcaseId }))
            )
            : Promise.resolve(),
        toRemove.length > 0
            ? AssignmentTestcase.deleteMany({ _id: { $in: toRemove } })
            : Promise.resolve(),
    ]);

    return { added: toAdd.length, removed: toRemove.length };
}
