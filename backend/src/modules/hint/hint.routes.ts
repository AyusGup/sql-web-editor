import { Router } from "express";
import { getSQLHintController } from "./hint.controller";
import { sqlHintSchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";
import { rateLimiter } from "../../middlewares/rate-limit.middleware";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", validateBody(sqlHintSchema), protect, rateLimiter, getSQLHintController);

export default router;