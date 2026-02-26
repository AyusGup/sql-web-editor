import { Router } from "express";
import { getSQLHintController } from "../../controllers/hint.controller";
import { sqlHintSchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";
import { rateLimiter } from "../../middlewares/rate-limit.middleware";

const router = Router();

router.post("/", validateBody(sqlHintSchema), rateLimiter, getSQLHintController);

export default router;