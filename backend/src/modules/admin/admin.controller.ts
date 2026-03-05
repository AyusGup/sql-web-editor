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

export const listAssignments = async (req: Request, res: Response) => {
    try {
        const list = await adminService.getAllAssignmentsAdmin();
        responseHandler(res, true, 200, "Assignments fetched", list);
    } catch (error: any) {
        logger.error("Admin assignments fetch failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to fetch assignments");
    }
};

export const createAssignment = async (req: Request, res: Response) => {
    try {
        const assignment = await adminService.createAssignmentAdmin(req.body);
        responseHandler(res, true, 201, "Assignment created", assignment);
    } catch (error: any) {
        logger.error("Admin assignment creation failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to create assignment");
    }
};

export const updateAssignment = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const assignment = await adminService.updateAssignmentAdmin(String(id), req.body);
        if (!assignment) return responseHandler(res, false, 404, "Assignment not found");
        responseHandler(res, true, 200, "Assignment updated", assignment);
    } catch (error: any) {
        logger.error("Admin assignment update failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to update assignment");
    }
};

export const listTestcases = async (req: Request, res: Response) => {
    try {
        const list = await adminService.getAllTestcasesAdmin();
        responseHandler(res, true, 200, "Testcases fetched", list);
    } catch (error: any) {
        logger.error("Admin testcases fetch failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to fetch testcases");
    }
};

export const createTestcase = async (req: Request, res: Response) => {
    try {
        const testcase = await adminService.createTestcaseAdmin(req.body);
        responseHandler(res, true, 201, "Testcase created", testcase);
    } catch (error: any) {
        logger.error("Admin testcase creation failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to create testcase");
    }
};

export const updateTestcase = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const testcase = await adminService.updateTestcaseAdmin(String(id), req.body);
        if (!testcase) return responseHandler(res, false, 404, "Testcase not found");
        responseHandler(res, true, 200, "Testcase updated", testcase);
    } catch (error: any) {
        logger.error("Admin testcase update failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to update testcase");
    }
};

export const syncLinks = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assignmentIds } = req.body;
    try {
        if (!Array.isArray(assignmentIds)) {
            return responseHandler(res, false, 400, "assignmentIds must be an array");
        }
        const result = await adminService.syncTestcaseLinks(String(id), assignmentIds);
        responseHandler(res, true, 200, "Links synced", result);
    } catch (error: any) {
        logger.error("Admin sync links failure: %s", error.message);
        responseHandler(res, false, 500, "Failed to sync links");
    }
};

export const searchAssignments = async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string || "";
        const results = await adminService.searchAssignmentsAdmin(q);
        responseHandler(res, true, 200, "Search results", results);
    } catch (error: any) {
        logger.error("Admin assignment search failed: %s", error.message);
        responseHandler(res, false, 500, "Failed to search assignments");
    }
};
