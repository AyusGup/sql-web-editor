import { Request, Response } from "express";
import { setAuthCookie, clearAuthCookie } from "../../utils/auth.utils";
import { createUser, findByUsername } from "./user.service";
import { responseHandler } from "../../shared/response";
import logger from "../../shared/logger";


export const registerController = async (req: Request, res: Response) => {
  const { username, password } = req.validatedBody;
  try {
    const existingUser = await findByUsername(username);
    if (existingUser) return responseHandler(res, false, 400, "Username taken");

    const user = await createUser(username, password);
    logger.debug("User created: %s", user.username);
    setAuthCookie(res, user._id.toString(), user.role);
    logger.debug("Auth cookie set for user: %s with role: %s", user.username, user.role);

    return responseHandler(res, true, 201, "User created", {
      username: user.username,
      role: user.role
    });
  } catch (error: any) {
    logger.error("Registration failed: %s", error.message);
    return responseHandler(res, false, 500, "Registration failed");
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.validatedBody;
  try {
    const user = await findByUsername(username);
    if (!user || !(await user.comparePassword(password))) {
      return responseHandler(res, false, 401, "Invalid credentials");
    }

    setAuthCookie(res, user._id.toString(), user.role);
    return responseHandler(res, true, 200, "Logged in successfully", {
      username: user.username,
      role: user.role
    });
  } catch (error: any) {
    logger.error("Login failed: %s", error.message);
    return responseHandler(res, false, 500, "Login failed");
  }
};

export const logoutController = (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};