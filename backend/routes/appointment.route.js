import express from "express";
import { getAvailableSlot } from "../controllers/appointment.controller.js";

const appointmentRouter = express.Router();

appointmentRouter.get("/all/:id", getAvailableSlot);

export default appointmentRouter;
  