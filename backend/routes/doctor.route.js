import express from "express";
import { approveAppointment, cancelAppointment, createDoctorProfile, deleteDoctorProfileAndAccount, getAvailableSeatsForDoctor, getTodaysAppointments, getTodaysRevenueEstimate, getUpcomingWeekAppointments, listAllDoctors, listDoctorsWithFilters, revenueForThisWeek, updateDoctorProfile } from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const doctorRouter = express.Router();

doctorRouter.post("/create-profile", authMiddleware, createDoctorProfile);
doctorRouter.put("/profile/update/:id", authMiddleware, updateDoctorProfile);
doctorRouter.delete("/delete/:id", authMiddleware, deleteDoctorProfileAndAccount);
doctorRouter.get("/doctors", listAllDoctors);
doctorRouter.post("/doctors/filter", listDoctorsWithFilters);
doctorRouter.get("/all-seats/:id", getAvailableSeatsForDoctor);
doctorRouter.get("/appointment/:id/approve", authMiddleware, approveAppointment);
doctorRouter.get("/appointment/:id/cancel", authMiddleware, cancelAppointment);
doctorRouter.get("/appointments/today", authMiddleware, getTodaysAppointments);
doctorRouter.get("/appointments/coming-week", authMiddleware, getUpcomingWeekAppointments);
doctorRouter.get("/today-revenue", authMiddleware, getTodaysRevenueEstimate);
doctorRouter.get("/week-revenue", authMiddleware, revenueForThisWeek);

export default doctorRouter;
