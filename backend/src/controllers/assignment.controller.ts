import { Request, Response } from "express";
import {
  getAssignments,
  getAssignmentById,
} from "../services/assignment.service";
import { responseHandler } from "../shared/response";
import UserProgress from "../db/models/UserProgress";
import { getUserProgressById } from "../services/user.service";


export async function listAssignments(req: Request, res: Response) {
  try {
    const { page, limit, difficulty, tags } = req.query;

    const result = await getAssignments({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      difficulty: difficulty as string,
      tags: tags ? (tags as string).split(",") : undefined,
    });

    return responseHandler(
      res,
      true,
      200,
      "Fetching assignments successful",
      result
    );
  } catch (err: any) {
    console.error("Error while fetching assignments:", err);

    return responseHandler(
      res,
      false,
      500,
      "Error while fetching assignments"
    );
  }
}

export async function getAssignment(req: Request, res: Response) {
  try {
    const { id } = req.validatedQuery;
    const result = await getAssignmentById(id);
    const progress = await getUserProgressById(req.userId as string, id);
    return responseHandler(
      res,
      true,
      200,
      "Fetching assignment successful",
      { result, progress}
    );
  } catch (err: any) {
    console.error("Error while fetching assignment:", err);
    
    if(err.message === "ASSIGNMENT_NOT_FOUND"){
      return responseHandler(
        res,
        false,
        404,
        "Assignment not found"
      );
    }
    
    return responseHandler(
      res,
      false,
      500,
      "Error while fetching assignment"
    );
  }
}

export async function saveController(req: Request, res: Response){
  try {
    const { assignmentId, sqlQuery } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.userId, assignmentId },
      { 
        sqlQuery
      },
      { upsert: true, new: true }
    );

    return responseHandler(
      res,
      true,
      200,
      "Progress saved successfully",
      progress
    );
  } catch (err: any) {
    console.error("Error while saving progress:", err);

    return responseHandler(
      res,
      false,
      500,
      "Error while saving progress"
    );
  }
}