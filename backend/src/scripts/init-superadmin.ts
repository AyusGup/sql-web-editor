import dotenv from "dotenv";
import User from "../db/models/User";
import { connectMongo } from "../db/config/mongo";

dotenv.config();

async function initSuperAdmin() {
    try {
        await connectMongo();

        const username = process.env.SUPERADMIN_USERNAME;
        const password = process.env.SUPERADMIN_PASSWORD;

        if (!username || !password) {
            console.error("SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD must be set in environment variables.");
            process.exit(1);
        }

        const existingSuperAdmin = await User.findOne({ role: "superadmin" });
        if (existingSuperAdmin) {
            console.log("Superadmin already exists. Skipping initialization.");
            process.exit(0);
        }

        // The pre-save hook in User model handles bcrypt hashing
        const superAdmin = new User({
            username,
            passwordHash: password, // Note: the pre-save hook expects this field name but it hashes it
            role: "superadmin",
        });

        await superAdmin.save();
        console.log(`Superadmin user '${username}' created successfully.`);
        process.exit(0);
    } catch (error) {
        console.error("Error initializing superadmin:", error);
        process.exit(1);
    }
}

initSuperAdmin();
