import { z } from "zod";


const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const assignmentParamSchema = z.object({
  id: objectId,
});

export const executeQuerySchema = z.object({
  userId: z.string().min(1, "UserId required"),

  assignmentId: objectId,

  query: z
    .string()
    .min(1, "Query cannot be empty")
    .max(5000, "Query too large"),
});