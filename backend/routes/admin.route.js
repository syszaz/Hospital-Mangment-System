import express from "express";
import { approveDoctor, fullList, getNotApprovedDoctors, notApproveDoctor } from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/admin.js";
import { authMiddleware } from "../middlewares/auth.js";

const adminRouter = express.Router();

adminRouter.get("/doctors/:id/approve", authMiddleware, adminMiddleware, approveDoctor);
adminRouter.get("/doctors/:id/cancel", authMiddleware, adminMiddleware, notApproveDoctor);
adminRouter.get("/doctors/not-approved", authMiddleware, adminMiddleware, getNotApprovedDoctors);
adminRouter.get("/full-list", authMiddleware, adminMiddleware, fullList);

export default adminRouter;