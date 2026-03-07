import { Response } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_EXPIRY } from "../shared/constants";


export const setAuthCookie = (res: Response, userId: string, role: string) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Must be true for sameSite: none
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_EXPIRY,
    path: "/",
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};