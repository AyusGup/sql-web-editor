import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/schema";


export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Please log in to access this resource" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Session expired or invalid" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(403).json({ error: "No role assigned" });
    }

    // Role hierarchy: superadmin can do everything admin can
    const effectiveRoles = [req.role];
    if (req.role === "superadmin") {
      effectiveRoles.push("admin");
    }

    const hasPermission = roles.some(role => effectiveRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
};