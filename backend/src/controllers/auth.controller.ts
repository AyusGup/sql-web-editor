import { Request, Response } from "express";
import { setAuthCookie, clearAuthCookie } from "../utils/auth.utils";
import { createUser, findByUsername } from "../services/user.service";


export const registerController = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const existingUser = await findByUsername(username);
    if (existingUser) return res.status(400).json({ error: "Username taken" });

    const user = await createUser(username, password);
    console.log(user);
    setAuthCookie(res, user._id.toString());
    console.log("cookie set");

    res.status(201).json({ message: "User created", user: { username: user.username } });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await findByUsername(username);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    setAuthCookie(res, user._id.toString());
    res.json({ message: "Logged in successfully", username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const logoutController = (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};