import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { responseHandler } from "../shared/response";


export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const parsedSchema = schema.parse(req.body);
      req.body = parsedSchema;
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return responseHandler(res, false, 400, undefined, undefined, {
          error: "Validation failed",
          details: formattedErrors,
        });
      }
      console.error("Getting error while parsing request body: ", err);
      responseHandler(res, false, 400, "Internal server error");
    }
  };

export const validateQueryParams =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request query params against schema
      const parsedSchema = schema.parse(req.query);
      req.validatedQuery = parsedSchema;
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return responseHandler(res, false, 400, undefined, undefined, {
          error: "Validation failed",
          details: formattedErrors,
        });
      }
      console.error("Getting error while parsing query params: ", err);
      responseHandler(res, false, 400, "Internal server error");
    }
  };