"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongo_1 = require("../src/db/config/mongo");
const Assignment_1 = __importDefault(require("../src/db/models/Assignment"));
const assignment_json_1 = __importDefault(require("./seeds/assignment.json"));
async function runSeed() {
    try {
        await (0, mongo_1.connectMongo)();
        console.log("Clearing old assignments...");
        await Assignment_1.default.deleteMany({});
        console.log("Inserting new assignments...");
        await Assignment_1.default.insertMany(assignment_json_1.default);
        console.log("Seed completed");
        process.exit(0);
    }
    catch (err) {
        console.error("Seed failed:", err);
        process.exit(1);
    }
}
runSeed();
