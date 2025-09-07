import express from "express";
import { approveAppointment, cancelAppointment, createDocotorProfile, deleteDoctorProfileAndAccount, getAvailableSeatsForDoctor, listAllDoctors, listDoctorsWithFilters, updateDoctorProfile } from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const doctorRouter = express.Router();

doctorRouter.post("/create-profile", authMiddleware, createDocotorProfile);
doctorRouter.put("/profile/update/:id", authMiddleware, updateDoctorProfile);
doctorRouter.delete("/delete/:id", authMiddleware, deleteDoctorProfileAndAccount);
doctorRouter.get("/doctors", listAllDoctors);
doctorRouter.post("/doctors/filter", listDoctorsWithFilters);
doctorRouter.get("/all-seats/:id", getAvailableSeatsForDoctor);
doctorRouter.get("/appointment/:id/approve", authMiddleware, approveAppointment);
doctorRouter.get("/appointment/:id/cancel", authMiddleware, cancelAppointment);

export default doctorRouter;
