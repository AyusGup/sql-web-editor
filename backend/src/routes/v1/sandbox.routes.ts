import { Router } from "express";
import { executeController } from "../../controllers/sandbox.controller";
import { executeQuerySchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/execute", validateBody(executeQuerySchema), protect, executeController);

export default router;