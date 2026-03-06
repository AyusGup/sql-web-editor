import User from "../../db/models/User";
import { paginate } from "../../shared/utils/pagination";
import { PAGINATION_LIMITS } from "../../shared/constants";

/**
 * List all users with admin roles.
 */
export async function listAdmins(page = 1, limit: number = PAGINATION_LIMITS.ADMIN) {
    const filter: any = { role: { $in: ["admin"] } };

    return paginate<any>(User, filter, {
        page,
        limit,
        sort: { createdAt: -1 },
        projection: "-password"
    });
}

/**
 * Update a user's role.
 * Prevents demoting the last superadmin.
 */
export async function updateUserRole(userId: string, newRole: "user" | "admin" | "superadmin") {
    const user = await User.findById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    if (newRole === "superadmin") throw new Error("CANNOT_PROMOTE_TO_SUPERADMIN");

    user.role = newRole;
    await user.save();
    return user;
}

/**
 * Delete a user (Superadmin only).
 */
export async function deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    if (user.role === "superadmin") {
        throw new Error("CANNOT_DELETE_SUPERADMIN");
    }

    await User.findByIdAndDelete(userId);
    return { success: true };
}
