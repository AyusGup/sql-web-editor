import { Request, Response } from "express";
import { getOrCreateSandbox } from "../sandbox/sandbox.manager";
import { executeSandboxQuery } from "../sandbox/sandbox.executor";
import { validateQuery } from "../sandbox/query.validator";
import { gradeResult } from "../services/grader.service";
import Assignment from "../db/models/Assignment";
import UserProgress from "../db/models/UserProgress";
import { responseHandler } from "../shared/response";


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

    // Get sandbox
    const sandbox = await getOrCreateSandbox(req.userId as string, assignmentId);

    // Execute query
    const rows = await executeSandboxQuery(sandbox.schema, query);

    // Grade result
    const grading = gradeResult(rows, assignment.expectedOutput);

    await UserProgress.findOneAndUpdate(
      { userId: req.userId, assignmentId },
      { 
          query, 
          $inc: { attemptCount: 1 }, 
          $max: { isCompleted: grading.correct },
          lastAttempt: new Date() 
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

    if (
      err.message.includes("Forbidden") ||
      err.message.includes("SELECT") ||
      err.message.includes("Multiple")
    ) {
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