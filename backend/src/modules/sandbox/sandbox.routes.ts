import { Router } from "express";
import { executeController } from "./sandbox.controller";
import { executeQuerySchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/run", validateBody(executeQuerySchema), protect, (req, res, next) => {
    req.body.type = "run";
    next();
}, executeController);

router.post("/submit", validateBody(executeQuerySchema), protect, (req, res, next) => {
    req.body.type = "submit";
    next();
}, executeController);

export default router;