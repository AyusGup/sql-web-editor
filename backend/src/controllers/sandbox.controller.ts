import { Request, Response } from "express";
import { getOrCreateSandbox } from "../sandbox/sandbox.manager";
import { executeSandboxQuery } from "../sandbox/sandbox.executor";
import { gradeResult } from "../services/grader.service";
import Assignment from "../db/models/Assignment";
import { responseHandler } from "../shared/response";


export async function executeController(req: Request, res: Response) {
  try {
    const { userId, assignmentId, query } = req.body;

    if (!userId || !assignmentId || !query) {
      return responseHandler(
        res,
        false,
        400,
        "Missing fields"
      );
    }

    // 1. Fetch assignment
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return responseHandler(
        res,
        false,
        404,
        "Assignment not found"
      );
    }

    // 2. Get sandbox
    const sandbox = await getOrCreateSandbox(userId, assignmentId);

    // 3. Execute query
    const rows = await executeSandboxQuery(sandbox.schema, query);

    // 4. Grade result
    const grading = gradeResult(rows, assignment.expectedOutput);

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
    return responseHandler(
      res,
      false,
      500,
      "Error while fetching assignments"
    );
  }
}