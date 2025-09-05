import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { updateUser, userProfile } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.put("/update/:id", authMiddleware, updateUser);
userRouter.get("/profile/:id", userProfile);

export default userRouter;
