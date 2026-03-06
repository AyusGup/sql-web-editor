import { Request, Response } from "express";
import * as adminService from "./admin.service";
import { responseHandler } from "../../shared/response";
import logger from "../../shared/logger";

export const getSummary = async (req: Request, res: Response) => {
    try {
        const summary = await adminService.getAdminSummary();
        responseHandler(res, true, 200, "Summary fetched", summary);
    } catch (error: any) {
        logger.error("Admin summary fetch failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to fetch summary");
    }
};

export const listUsers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.validatedQuery.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.validatedQuery.limit) || 20));

        const result = await adminService.getUsersAdmin(page, limit);
        responseHandler(res, true, 200, "Users fetched", result);
    } catch (error: any) {
        logger.error("Admin users fetch failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to fetch users");
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const q = req.validatedQuery.q || "";
        const results = await adminService.searchUsersAdmin(q);
        responseHandler(res, true, 200, "Search results", results);
    } catch (error: any) {
        logger.error("Admin user search failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to search users");
    }
};

export const listAssignments = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.validatedQuery.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.validatedQuery.limit) || 20));
        const result = await adminService.getAllAssignmentsAdmin(page, limit);
        responseHandler(res, true, 200, "Assignments fetched", result);
    } catch (error: any) {
        logger.error("Admin assignments fetch failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to fetch assignments");
    }
};

export const searchAssignments = async (req: Request, res: Response) => {
    try {
        const q = req.validatedQuery.q || "";
        const results = await adminService.searchAssignmentsAdmin(q);
        responseHandler(res, true, 200, "Search results", results);
    } catch (error: any) {
        logger.error("Admin assignment search failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to search assignments");
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    try {
        const assignment = await adminService.createAssignmentAdmin(req.validatedBody);
        responseHandler(res, true, 201, "Assignment created", assignment);
    } catch (error: any) {
        logger.error("Admin assignment creation failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to create assignment");
    }
};

export const updateAssignment = async (req: Request, res: Response) => {
    const { id } = req.validatedParams;
    try {
        const assignment = await adminService.updateAssignmentAdmin(id, req.validatedBody);
        if (!assignment) return responseHandler(res, false, 404, "Assignment not found");
        responseHandler(res, true, 200, "Assignment updated", assignment);
    } catch (error: any) {
        if (error.message === "CONFLICT") {
            return responseHandler(res, false, 409, "Conflict: assignment was modified by another admin. Please reload.");
        }
        logger.error("Admin assignment update failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to update assignment");
    }
};

export const deleteAssignment = async (req: Request, res: Response) => {
    const { id } = req.validatedParams;
    try {
        const deleted = await adminService.deleteAssignmentAdmin(id);
        if (!deleted) return responseHandler(res, false, 404, "Assignment not found");
        responseHandler(res, true, 200, "Assignment deleted", deleted);
    } catch (error: any) {
        logger.error("Admin assignment delete failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to delete assignment");
    }
};

export const listTestcases = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.validatedQuery.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.validatedQuery.limit) || 20));
        const result = await adminService.getAllTestcasesAdmin(page, limit);
        responseHandler(res, true, 200, "Testcases fetched", result);
    } catch (error: any) {
        logger.error("Admin testcases fetch failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to fetch testcases");
    }
};

export const createTestcase = async (req: Request, res: Response) => {
    try {
        const testcase = await adminService.createTestcaseAdmin(req.validatedBody);
        responseHandler(res, true, 201, "Testcase created", testcase);
    } catch (error: any) {
        logger.error("Admin testcase creation failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to create testcase");
    }
};

export const updateTestcase = async (req: Request, res: Response) => {
    const { id } = req.validatedParams;
    try {
        const testcase = await adminService.updateTestcaseAdmin(id, req.validatedBody);
        if (!testcase) return responseHandler(res, false, 404, "Testcase not found");
        responseHandler(res, true, 200, "Testcase updated", testcase);
    } catch (error: any) {
        if (error.message === "CONFLICT") {
            return responseHandler(res, false, 409, "Conflict: testcase was modified by another admin. Please reload.");
        }
        logger.error("Admin testcase update failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to update testcase");
    }
};

export const deleteTestcase = async (req: Request, res: Response) => {
    const { id } = req.validatedParams || req.params;
    try {
        const deleted = await adminService.deleteTestcaseAdmin(id);
        if (!deleted) return responseHandler(res, false, 404, "Testcase not found");
        responseHandler(res, true, 200, "Testcase deleted", deleted);
    } catch (error: any) {
        logger.error("Admin testcase delete failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to delete testcase");
    }
};

export const syncLinks = async (req: Request, res: Response) => {
    const { id } = req.validatedParams;
    const { assignmentIds } = req.validatedBody;
    try {
        if (!Array.isArray(assignmentIds)) {
            return responseHandler(res, false, 400, "assignmentIds must be an array");
        }
        const result = await adminService.syncTestcaseLinks(id, assignmentIds);
        responseHandler(res, true, 200, "Links synced", result);
    } catch (error: any) {
        logger.error("Admin sync links failure: %s", error.message);
        responseHandler(res, false, 500, "Failed to sync links");
    }
};
