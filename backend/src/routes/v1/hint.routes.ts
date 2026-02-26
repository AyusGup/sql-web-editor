import { Router } from "express";
import { getSQLHintController } from "../../controllers/hint.controller";
import { sqlHintSchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";

const router = Router();

router.post("/", validateBody(sqlHintSchema), getSQLHintController);

export default router;