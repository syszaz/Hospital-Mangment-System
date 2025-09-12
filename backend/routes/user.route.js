import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { updateUser, userProfileByEmail } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.put("/update/:id", authMiddleware, updateUser);
userRouter.get("/profile/:email", userProfileByEmail);

export default userRouter;
