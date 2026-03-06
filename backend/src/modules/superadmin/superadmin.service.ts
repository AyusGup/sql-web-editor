import User from "../../db/models/User";
import { paginate } from "../../shared/utils/pagination";

/**
 * List all users with admin roles.
 */
export async function listAdmins(page = 1, limit = 20) {
    const filter: any = { role: { $in: ["admin"] } };

    return paginate<any>(User, filter, {
        page,
        limit,
        sort: { createdAt: -1 },
        projection: "-password"
    });
}

/**
 * Search for users to potentially promote to admin.
 */
export async function searchUsers(query: string) {
    if (!query || query.length < 2) return [];
    return User.find({
        username: { $regex: query, $options: "i" },
        role: { $in: ["user", "admin"] }
    })
        .select("_id username role")
        .limit(10)
        .lean();
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
