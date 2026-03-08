import User from "../db/models/User";
import logger from "../shared/logger";

export async function initSuperAdmin() {
    try {
        const username = process.env.SUPERADMIN_USERNAME;
        const password = process.env.SUPERADMIN_PASSWORD;

        if (!username || !password) {
            logger.warn("SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD are not set. Skipping superadmin initialization.");
            return;
        }

        const existingSuperAdmin = await User.findOne({ role: "superadmin" });
        if (existingSuperAdmin) {
            logger.info("Superadmin already exists. Skipping initialization.");
            return;
        }

        const superAdmin = new User({
            username,
            passwordHash: password, // The pre-save hook handles hashing
            role: "superadmin",
        });

        await superAdmin.save();
        logger.info(`Superadmin user '${username}' created successfully.`);
    } catch (error) {
        logger.error("Error initializing superadmin: " + error);
        // We log the error but do not crash the app startup.
    }
}
