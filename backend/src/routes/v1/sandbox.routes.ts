import { Router } from "express";
import { executeController } from "../../controllers/sandbox.controller";
import { executeQuerySchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";

const router = Router();

router.post("/execute", validateBody(executeQuerySchema), executeController);

export default router;