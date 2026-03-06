import { Router } from "express";
import * as superAdminController from "./superadmin.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import { validateBody, validateParams, validateQueryParams } from "../../middlewares/schema-validation.middleware";
import { updateRoleSchema, userIdParamSchema, userSearchSchema } from "../../shared/zod/schema";

const router = Router();

// All routes here require superadmin role
router.use(protect, authorize("superadmin"));

router.get("/admins", superAdminController.listAdmins);
router.get("/search-users", validateQueryParams(userSearchSchema), superAdminController.searchUsers);
router.patch("/users/:userId/role", validateParams(userIdParamSchema), validateBody(updateRoleSchema), superAdminController.updateUserRole);
router.delete("/users/:userId", validateParams(userIdParamSchema), superAdminController.deleteUser);

export default router;
