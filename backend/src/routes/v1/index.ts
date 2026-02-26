import { Router } from "express";
import assignmentRoutes from "./assignment.routes";
import sandboxRoutes from "./sandbox.routes";
import hintRoutes from "./hint.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/assignment", assignmentRoutes);
router.use("/sandbox", sandboxRoutes);
router.use("/hint", hintRoutes);
router.use("/user", userRoutes);

export default router;
