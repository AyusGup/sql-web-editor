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
    return Testcase.find().sort({ createdAt: -1 }).lean();
}

export async function createTestcaseAdmin(data: any) {
    return Testcase.create(data);
}

export async function updateTestcaseAdmin(id: string, data: any) {
    return Testcase.findByIdAndUpdate(id, data, { new: true }).lean();
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
