import { Router } from "express";
import assignmentRoutes from "../../modules/assignment/assignment.routes";
import sandboxRoutes from "../../modules/sandbox/sandbox.routes";
import hintRoutes from "../../modules/hint/hint.routes";
import userRoutes from "../../modules/user/user.routes";
import adminRoutes from "../../modules/admin/admin.routes";

const router = Router();

router.use("/assignment", assignmentRoutes);
router.use("/sandbox", sandboxRoutes);
router.use("/hint", hintRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

export default router;
