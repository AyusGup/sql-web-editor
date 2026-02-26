import { Router } from "express";
import {
  listAssignments,
  getAssignment,
} from "../../controllers/assignment.controller";
import { assignmentParamSchema } from "../../shared/zod/schema";
import { validateQueryParams } from "../../middlewares/schema-validation.middleware";

const router = Router();

router.get("/", listAssignments);
router.get("/:id", validateQueryParams(assignmentParamSchema), getAssignment);

export default router;