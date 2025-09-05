import express from "express";
import { SignInUser, SignUpUser } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", SignUpUser);
authRouter.post("/signin", SignInUser);

export default authRouter;
