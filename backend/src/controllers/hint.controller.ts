import { Request, Response } from "express";
import { getSQLHint } from "../services/hint.service";
import { responseHandler } from "../shared/response";


export async function getSQLHintController(req: Request, res: Response) {
  try {
    const { problemId, userQuery } = req.body;

    const hint = await getSQLHint(problemId, userQuery);

    return res.status(200).json({
      success: true,
      data: {
        hint,
      },
    });
  } catch (error: any) {
    console.error("SQL hint error:", error);

    if (error.message === "ASSIGNMENT_NOT_FOUND") {
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
      "Error while generating hint"
    );
  }
}