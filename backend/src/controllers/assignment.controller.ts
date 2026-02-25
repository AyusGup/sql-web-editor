import { Request, Response } from "express";
import {
  getAssignments,
  getAssignmentById,
} from "../services/assignment.service";

export async function listAssignments(req: Request, res: Response) {
  try {
    const { page, limit, difficulty, tags } = req.query;

    const result = await getAssignments({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      difficulty: difficulty as string,
      tags: tags ? (tags as string).split(",") : undefined,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAssignment(req: Request, res: Response) {
  try {
    const result = await getAssignmentById(req.params.id as string);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}