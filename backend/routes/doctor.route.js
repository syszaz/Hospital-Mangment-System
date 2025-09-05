import express from "express";
import { createDocotorProfile, deleteDoctorProfileAndAccount, listAllDoctors, updateDoctorProfile } from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const doctorRouter = express.Router();

doctorRouter.post("/create-profile", authMiddleware, createDocotorProfile);
doctorRouter.put("/profile/update/:id", authMiddleware, updateDoctorProfile);
doctorRouter.delete("/delete/:id", authMiddleware, deleteDoctorProfileAndAccount);
doctorRouter.get("/doctors", listAllDoctors);

export default doctorRouter;
