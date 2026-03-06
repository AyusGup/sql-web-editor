import { Router } from "express";
import {
  listAssignments,
  getAssignment,
} from "./assignment.controller";
import { idParamSchema, paginationQuerySchema } from "../../shared/zod/schema";
import { validateQueryParams } from "../../middlewares/schema-validation.middleware";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", validateQueryParams(idParamSchema), getAssignment);
router.get("/list", validateQueryParams(paginationQuerySchema), listAssignments);

export default router;