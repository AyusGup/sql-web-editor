import Assignment from "../../db/models/Assignment";
import Testcase from "../../db/models/Testcase";
import { paginate, paginateAggregate } from "../../shared/utils/pagination";
import AssignmentTestcase from "../../db/models/AssignmentTestcase";
import User from "../../db/models/User";
import { PAGINATION_LIMITS, SEARCH_LIMITS } from "../../shared/constants";
import { escapeRegex } from "../../shared/utils/regex";

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

export async function getUsersAdmin(page = 1, limit: number = PAGINATION_LIMITS.ADMIN) {
    return paginate<any>(User, { role: "user" }, {
        page,
        limit,
        sort: { createdAt: -1 },
        projection: "-password"
    });
}

export async function searchUsersAdmin(query: string) {
    if (!query || query.trim().length < SEARCH_LIMITS.MIN_QUERY_LENGTH) return [];
    return User.find({
        username: { $regex: escapeRegex(query.trim()), $options: "i" },
        role: "user"
    }).select("-password").limit(SEARCH_LIMITS.USER).lean();
}

export async function getAllAssignmentsAdmin(page = 1, limit: number = PAGINATION_LIMITS.ADMIN) {
    return paginate<any>(Assignment, {}, { page, limit, sort: { createdAt: -1 } });
}

export async function createAssignmentAdmin(data: any) {
    return Assignment.create(data);
}

export async function updateAssignmentAdmin(id: string, data: any) {
    const { version, ...updateData } = data;
    const filter: any = { _id: id };
    if (typeof version === "number") filter.version = version;

    const doc = await Assignment.findOneAndUpdate(
        filter,
        { $set: updateData, $inc: { version: 1 } },
        { new: true }
    ).lean();

    if (!doc && typeof version === "number") throw new Error("CONFLICT");
    return doc;
}

export async function deleteAssignmentAdmin(id: string) {
    const [deleted] = await Promise.all([
        Assignment.findByIdAndDelete(id).lean(),
        AssignmentTestcase.deleteMany({ assignmentId: id }),
    ]);
    return deleted;
}

export async function getAllTestcasesAdmin(page = 1, limit: number = PAGINATION_LIMITS.ADMIN) {
    const basePipeline = [{ $sort: { createdAt: -1 } }];

    const postPaginationPipeline = [
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
    ];

    return paginateAggregate<any>(
        Testcase,
        basePipeline,
        postPaginationPipeline,
        { page, limit }
    );
}


export async function createTestcaseAdmin(data: any) {
    return Testcase.create(data);
}

export async function updateTestcaseAdmin(id: string, data: any) {
    const { version, ...updateData } = data;
    const filter: any = { _id: id };
    if (typeof version === "number") filter.version = version;

    const doc = await Testcase.findOneAndUpdate(
        filter,
        { $set: updateData, $inc: { version: 1 } },
        { new: true }
    ).lean();

    if (!doc && typeof version === "number") throw new Error("CONFLICT");
    return doc;
}

export async function deleteTestcaseAdmin(id: string) {
    const [deleted] = await Promise.all([
        Testcase.findByIdAndDelete(id).lean(),
        AssignmentTestcase.deleteMany({ testcaseId: id }),
    ]);
    return deleted;
}

export async function searchAssignmentsAdmin(query: string) {
    if (!query || query.trim().length < SEARCH_LIMITS.MIN_QUERY_LENGTH) return [];

    const q = query.trim();

    // $text does word-based matching (ranked by relevance)
    const results = await Assignment.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" }, title: 1, difficulty: 1 }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(SEARCH_LIMITS.ASSIGNMENT)
        .lean();

    if (results.length > 0) return results;

    // Fallback: substring matching via regex 
    return Assignment.find(
        { title: { $regex: escapeRegex(q), $options: "i" } },
        { title: 1, difficulty: 1 }
    )
        .limit(SEARCH_LIMITS.ASSIGNMENT)
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
