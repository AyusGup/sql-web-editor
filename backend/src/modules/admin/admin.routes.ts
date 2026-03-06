import { Router } from "express";
import * as adminController from "./admin.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import { validateBody, validateParams, validateQueryParams } from "../../middlewares/schema-validation.middleware";
import {
    idParamSchema,
    paginationQuerySchema,
    assignmentBodySchema,
    assignmentUpdateSchema,
    testcaseBodySchema,
    testcaseUpdateSchema,
    syncLinksSchema,
    userSearchSchema
} from "../../shared/zod/schema";

const router = Router();

// Apply auth and admin check globally for this router
router.use(protect, authorize("admin"));

router.get("/summary", adminController.getSummary);

router.get("/assignments", validateQueryParams(paginationQuerySchema), adminController.listAssignments);
router.get("/assignments/search", validateQueryParams(userSearchSchema), adminController.searchAssignments);
router.get("/testcases", validateQueryParams(paginationQuerySchema), adminController.listTestcases);

router.post("/assignments", validateBody(assignmentBodySchema), adminController.createAssignment);
router.patch("/assignments/:id", validateParams(idParamSchema), validateBody(assignmentUpdateSchema), adminController.updateAssignment);
router.delete("/assignments/:id", validateParams(idParamSchema), adminController.deleteAssignment);

router.post("/testcases", validateBody(testcaseBodySchema), adminController.createTestcase);
router.patch("/testcases/:id", validateParams(idParamSchema), validateBody(testcaseUpdateSchema), adminController.updateTestcase);
router.delete("/testcases/:id", validateParams(idParamSchema), adminController.deleteTestcase);

router.put("/testcases/:id/links", validateParams(idParamSchema), validateBody(syncLinksSchema), adminController.syncLinks);

export default router;
