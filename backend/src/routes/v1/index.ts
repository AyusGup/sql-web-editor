import { Router } from "express";
import assignmentRoutes from "./assignment.routes";
import sandboxRoutes from "./sandbox.routes";

const router = Router();

router.use("/assignment", assignmentRoutes);
router.use("/sandbox", sandboxRoutes);

export default router;
