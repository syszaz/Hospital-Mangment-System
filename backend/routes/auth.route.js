import express from "express";
import {
  getMe,
  SignInUser,
  SignUpUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post("/signup", SignUpUser);
authRouter.post("/signin", SignInUser);
authRouter.get("/get-me", authMiddleware, getMe);

export default authRouter;
