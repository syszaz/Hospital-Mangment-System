import express from "express";
import { authMiddleware } from "../middlewares/auth.js";

import { createPatientProfile, deletePatientProfileAndAccount, getPatientByID, listAllPatients, nextAppointments, updatePatientProfile } from "../controllers/patient.controller.js";

const patientRouter = express.Router();

patientRouter.post("/create-profile", authMiddleware, createPatientProfile);
patientRouter.put("/update-profile/:id", authMiddleware, updatePatientProfile);
patientRouter.delete("/delete", authMiddleware, deletePatientProfileAndAccount);
patientRouter.get("/patients-all", authMiddleware, listAllPatients);
patientRouter.get("/name/:id", authMiddleware, getPatientByID);
patientRouter.get("/next-appointment", authMiddleware, nextAppointments);

export default patientRouter;
