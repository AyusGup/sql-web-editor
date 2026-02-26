import { Router } from "express";
import {
  listAssignments,
  getAssignment,
} from "../../controllers/assignment.controller";
import { assignmentParamSchema } from "../../shared/zod/schema";
import { validateQueryParams } from "../../middlewares/schema-validation.middleware";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", validateQueryParams(assignmentParamSchema), protect, getAssignment);
router.get("/list", protect, listAssignments);

export default router;