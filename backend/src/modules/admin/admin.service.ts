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

export async function linkTestcaseToAssignment(assignmentId: string, testcaseId: string) {
    return AssignmentTestcase.findOneAndUpdate(
        { assignmentId, testcaseId },
        { assignmentId, testcaseId },
        { upsert: true, new: true }
    ).lean();
}

export async function unlinkTestcaseFromAssignment(assignmentId: string, testcaseId: string) {
    return AssignmentTestcase.findOneAndDelete({ assignmentId, testcaseId }).lean();
}
