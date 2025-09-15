import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { bookAppointment, deleteAppointment, getAllAppointments, updateAppointmentDate } from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/book/:id", authMiddleware, bookAppointment);
appointmentRouter.put("/update/:id", authMiddleware, updateAppointmentDate);
appointmentRouter.delete("/delete/:id", authMiddleware, deleteAppointment);
appointmentRouter.get("/appointments/all/:id", authMiddleware, getAllAppointments);

export default appointmentRouter;
