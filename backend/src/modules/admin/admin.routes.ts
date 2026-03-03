import { Router } from "express";
import * as adminController from "./admin.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";

const router = Router();

// Apply auth and admin check globally for this router
router.use(protect, authorize("admin"));

router.get("/summary", adminController.getSummary);

router.get("/assignments", adminController.listAssignments);
router.get("/testcases", adminController.listTestcases);

router.post("/assignments", adminController.createAssignment);
router.patch("/assignments/:id", adminController.updateAssignment);

router.post("/testcases", adminController.createTestcase);
router.patch("/testcases/:id", adminController.updateTestcase);

router.post("/testcases/link", adminController.linkTestcase);
router.delete("/testcases/unlink/:assignmentId/:testcaseId", adminController.unlinkTestcase);

export default router;
