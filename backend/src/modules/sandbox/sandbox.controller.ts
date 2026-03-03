import { Request, Response } from "express";
import { executeInSandbox } from "./sandbox.manager";
import { validateQuery } from "./query.validator";
import { gradeResult } from "../grader/grader.service";
import Assignment from "../../db/models/Assignment";
import UserProgress from "../../db/models/UserProgress";
import { getTestcasesForAssignment } from "../assignment/assignment.service";
import { responseHandler } from "../../shared/response";
import logger from "../../shared/logger";


export async function executeController(req: Request, res: Response) {
  try {
    const { assignmentId, query, type = "run" } = req.body;

    validateQuery(query);

    // Fetch assignment
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return responseHandler(
        res,
        false,
        404,
        "Assignment not found"
      );
    }

    // Fetch testcases based on type
    const testcases = await getTestcasesForAssignment(assignmentId, type === "run");

    if (!testcases.length) {
      return responseHandler(
        res,
        false,
        500,
        "No testcases found for this assignment"
      );
    }

    const testcaseResults: any[] = [];
    let allPassed = true;
    let failedIdx = -1;

    for (let i = 0; i < testcases.length; i++) {
      const tc = testcases[i];
      const tid = (tc._id as any).toString();

      const rows = await executeInSandbox(
        req.userId as string,
        tid,
        tc.sampleTables,
        query
      );

      const grading = gradeResult(rows, tc.expectedOutput);

      // Only expose details for visible testcases
      if (tc.visible) {
        testcaseResults.push({
          testcaseId: tid,
          rows,
          grading,
          visible: tc.visible
        });
      }

      if (!grading.correct) {
        allPassed = false;
        failedIdx = i;
        if (type === "submit") break; // Stop at first failure on submit
      }
    }

    // Prepare overall status
    const gradingResponse = {
      correct: allPassed,
      message: allPassed
        ? type === "submit"
          ? `Assignment completed successfully! All ${testcases.length} test cases passed.`
          : `Success: Your query passed all sample test cases. Click 'Submit' to finish.`
        : type === "submit"
          ? `Failed: Wrong answer at test case ${failedIdx + 1}.`
          : `Failed: One or more visible test cases did not match sample output.`
    };

    // Update progress only on SUBMIT
    if (type === "submit") {
      const updateData: any = {
        $set: { sqlQuery: query, lastAttempt: new Date() },
        $inc: { attemptCount: 1 }
      };

      // Only set isCompleted to true if passed, never set it back to false
      if (allPassed) {
        updateData.$set.isCompleted = true;
      }

      await UserProgress.findOneAndUpdate(
        { userId: req.userId, assignmentId },
        updateData,
        { upsert: true, new: true }
      );
    }

    return responseHandler(
      res,
      true,
      200,
      "Execution Complete",
      {
        type,
        results: testcaseResults,
        grading: gradingResponse
      }
    );
  } catch (err: any) {
    logger.error("Error while executing query in sandbox: %s", err.message);

    // PostgreSQL specific error codes (Class 42 — Syntax Error or Access Rule Violation)
    // or specific validation errors
    const isUserError =
      err.code?.startsWith("42") ||
      err.message.includes("Forbidden") ||
      err.message.includes("SELECT") ||
      err.message.includes("Multiple");

    if (isUserError) {
      return responseHandler(res, false, 400, err.message);
    }

    return responseHandler(
      res,
      false,
      500,
      "Error while executing query"
    );
  }
}