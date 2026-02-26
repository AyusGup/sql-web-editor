import { Router } from "express";
import { executeController } from "../../controllers/sandbox.controller";

const router = Router();

router.post("/execute", executeController);

export default router;