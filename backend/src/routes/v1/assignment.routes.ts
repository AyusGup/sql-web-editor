import { Router } from "express";
import {
  listAssignments,
  getAssignment,
} from "../../controllers/assignment.controller";

const router = Router();

router.get("/", listAssignments);
router.get("/:id", getAssignment);

export default router;