import { z } from "zod";


const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const assignmentParamSchema = z.object({
  id: objectId,
});

export const usernameSchema = z
  .string()
  .regex(
    /^[A-Za-z0-9_]+$/,
    "Only letters, numbers, and underscores are allowed",
  )
  .min(3, "Username should contain at least 3 characters")
  .max(255, "Maximum 255 characters are allowed");

const passwordSchema = z
  .string()
  .min(8, "Password should contain at least 8 characters")
  .max(255, "Maximum 255 characters are allowed")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
    "Password must contain at least one letter, one number and one special character",
  );

export const authSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
});

export const saveSchema = z.object({
  assignmentId: objectId,
  sqlQuery: z.string()
});

export const executeQuerySchema = z.object({
  assignmentId: objectId,

  query: z
    .string()
    .min(1, "Query cannot be empty")
    .max(5000, "Query too large"),
});

export const sqlHintSchema = z.object({
  problemId: objectId,
  userQuery: z.string()
});