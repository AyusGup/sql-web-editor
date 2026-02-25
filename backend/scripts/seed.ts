import dotenv from "dotenv";
dotenv.config();

import { connectMongo } from "../src/db/config/mongo";
import Assignment from "../src/db/models/Assignment";
import assignments from "./seeds/assignment.json";

async function runSeed() {
  try {
    await connectMongo();

    console.log("Clearing old assignments...");
    await Assignment.deleteMany({});

    console.log("Inserting new assignments...");
    await Assignment.insertMany(assignments);

    console.log("Seed completed");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

runSeed();