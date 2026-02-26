import { Request, Response } from "express";
import {
  getAssignments,
  getAssignmentById,
} from "../services/assignment.service";
import { responseHandler } from "../shared/response";


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
    const result = await getAssignmentById(req.params.id as string);
    return responseHandler(
      res,
      true,
      200,
      "Fetching assignment successful",
      result
    );
  } catch (err: any) {
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