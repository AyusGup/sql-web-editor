import dotenv from "dotenv";
dotenv.config();

import { connectMongo } from "../src/db/config/mongo";
import Assignment from "../src/db/models/Assignment";
import Testcase from "../src/db/models/Testcase";
import AssignmentTestcase from "../src/db/models/AssignmentTestcase";
import assignments from "./data/assignment.json";

async function runSeed() {
  try {
    await connectMongo();

    console.log("Clearing old data...");
    await AssignmentTestcase.deleteMany({});
    await Testcase.deleteMany({});
    await Assignment.deleteMany({});

    console.log("Inserting assignments and testcases...");

    for (const item of assignments) {
      const { testcases, ...assignmentData } = item;

      // Create the assignment (without testcases)
      const assignment = await Assignment.create(assignmentData);

      // Create each testcase and link it
      for (const tc of testcases) {
        const testcase = await Testcase.create(tc);

        await AssignmentTestcase.create({
          assignmentId: assignment._id,
          testcaseId: testcase._id,
        });
      }

      console.log(`  ✓ ${assignmentData.title} (${testcases.length} testcases)`);
    }

    console.log("Seed completed");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

runSeed();