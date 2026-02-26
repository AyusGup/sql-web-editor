import { Response } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_EXPIRY } from "../shared/constants";


export const setAuthCookie = (res: Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only over HTTPS in prod
    sameSite: "strict",
    maxAge: COOKIE_EXPIRY,
    path: "/",
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};