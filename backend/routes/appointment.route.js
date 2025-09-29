import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  approveAppointment,
  bookAppointment,
  cancelAppointment,
  completeAppointment,
  deleteAppointment,
  getAllAppointments,
  getDoctorPatients,
  getPatientAppointments,
  getTodaysAppointments,
  getTodaysRevenueEstimate,
  getUpcomingWeekAppointments,
  revenueForThisWeek,
  updateAppointmentDate,
} from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/book/:id", authMiddleware, bookAppointment);
appointmentRouter.put("/update/:id", authMiddleware, updateAppointmentDate);
appointmentRouter.delete("/delete/:id", authMiddleware, deleteAppointment);
appointmentRouter.get(
  "/appointments/all/:id",
  authMiddleware,
  getAllAppointments
);
appointmentRouter.get(
  "/appointment/:id/approve",
  authMiddleware,
  approveAppointment
);
appointmentRouter.put(
  "/appointment/:id/cancel",
  authMiddleware,
  cancelAppointment
);
appointmentRouter.put(
  "/appointment/:id/complete",
  authMiddleware,
  completeAppointment
);
appointmentRouter.get(
  "/appointments/today",
  authMiddleware,
  getTodaysAppointments
);
appointmentRouter.get(
  "/appointments/coming-week",
  authMiddleware,
  getUpcomingWeekAppointments
);
appointmentRouter.get(
  "/today-revenue",
  authMiddleware,
  getTodaysRevenueEstimate
);
appointmentRouter.get("/week-revenue", authMiddleware, revenueForThisWeek);
appointmentRouter.get("/all-patients", authMiddleware, getDoctorPatients);
appointmentRouter.get("/all-appointments/:id", authMiddleware, getPatientAppointments);

export default appointmentRouter;
