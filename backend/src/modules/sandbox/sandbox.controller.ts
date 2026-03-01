import { Request, Response } from "express";
import { executeInSandbox } from "./sandbox.manager";
import { validateQuery } from "./query.validator";
import { gradeResult } from "../grader/grader.service";
import Assignment from "../../db/models/Assignment";
import UserProgress from "../../db/models/UserProgress";
import { responseHandler } from "../../shared/response";


export async function executeController(req: Request, res: Response) {
  try {
    const { assignmentId, query } = req.body;

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

    // Execute query through the full sandbox flow:
    //   Cache check → DB lookup → Schema create → Execute → Job management → Error recovery
    const rows = await executeInSandbox(req.userId as string, assignmentId, query);

    // Grade result
    const grading = gradeResult(rows, assignment.expectedOutput);

    await UserProgress.findOneAndUpdate(
      { userId: req.userId, assignmentId },
      {
        $set: { sqlQuery: query, lastAttempt: new Date() },
        $inc: { attemptCount: 1 },
        $max: { isCompleted: grading.correct }
      },
      { upsert: true, new: true }
    );

    return responseHandler(
      res,
      true,
      200,
      "Query Executed Successfully",
      {
        rows,
        grading,
      }
    );
  } catch (err: any) {
    console.error("Error while executing query in sandbox:", err);

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