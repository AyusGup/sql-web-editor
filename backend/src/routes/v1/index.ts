import { Router } from "express";
import assignmentRoutes from "./assignment.routes";
import sandboxRoutes from "./sandbox.routes";
import hintRoutes from "./hint.routes";

const router = Router();

router.use("/assignment", assignmentRoutes);
router.use("/sandbox", sandboxRoutes);
router.use("/hint", hintRoutes);

export default router;
