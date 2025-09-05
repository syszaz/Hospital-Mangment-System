import express from "express";
import { approveDoctor, getNotApprovedDoctors } from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/admin.js";
import { authMiddleware } from "../middlewares/auth.js";

const adminRouter = express.Router();

adminRouter.get("/doctors/:id/approve", authMiddleware, adminMiddleware, approveDoctor);
adminRouter.get("/doctors/not-approved", authMiddleware, adminMiddleware, getNotApprovedDoctors);

export default adminRouter;