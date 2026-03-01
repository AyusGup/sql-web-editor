import { Router } from "express";
import { authSchema, saveSchema } from "../../shared/zod/schema";
import { validateBody } from "../../middlewares/schema-validation.middleware";
import { loginController, logoutController, registerController } from "./auth.controller";
import { protect } from "../../middlewares/auth.middleware";
import { saveController } from "../assignment/assignment.controller";

const router = Router();

router.post("/register", validateBody(authSchema), registerController);
router.post("/login", validateBody(authSchema), loginController);
router.post("/logout", protect, logoutController);
router.post("/save", validateBody(saveSchema), protect, saveController);

export default router;