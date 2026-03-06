import { Request, Response } from "express";
import * as superAdminService from "./superadmin.service";
import logger from "../../shared/logger";

export async function listAdmins(req: Request, res: Response) {
    try {
        const page = Math.max(1, parseInt(req.validatedQuery.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.validatedQuery.limit) || 20));

        const admins = await superAdminService.listAdmins(page, limit);
        res.json({ data: admins });
    } catch (error) {
        logger.error("Error listing admins:", error);
        res.status(500).json({ error: "Failed to list admins" });
    }
}

export async function updateUserRole(req: Request, res: Response) {
    try {
        const { userId } = req.validatedParams;
        const { role } = req.validatedBody;

        const user = await superAdminService.updateUserRole(userId, role);
        res.json({ data: user, message: "User role updated successfully" });
    } catch (error: any) {
        logger.error("Error updating user role:", error);
        if (error.message === "CANNOT_DEMOTE_LAST_SUPERADMIN") {
            res.status(400).json({ error: "Cannot demote the last superadmin" });
        } else {
            res.status(500).json({ error: "Failed to update user role" });
        }
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { userId } = req.validatedParams;
        await superAdminService.deleteUser(userId);
        res.json({ message: "User deleted successfully" });
    } catch (error: any) {
        logger.error("Error deleting user:", error);
        if (error.message === "CANNOT_DELETE_LAST_SUPERADMIN") {
            res.status(400).json({ error: "Cannot delete the last superadmin" });
        } else {
            res.status(500).json({ error: "Failed to delete user" });
        }
    }
}
