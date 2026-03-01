import { Request, Response } from "express";
import { getSQLHint } from "./hint.service";
import { responseHandler } from "../../shared/response";
import logger from "../../shared/logger";


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
    logger.error("SQL hint error: %s", error.message);

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