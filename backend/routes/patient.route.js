import express from "express";
import { authMiddleware } from "../middlewares/auth.js";

import { createPatientProfile, deletePatientProfileAndAccount, listAllPatients, updatePatientProfile } from "../controllers/patient.controller.js";

const patientRouter = express.Router();

patientRouter.post("/create-profile", authMiddleware, createPatientProfile);
patientRouter.put("/update-profile/:id", authMiddleware, updatePatientProfile);
patientRouter.delete("/delete", authMiddleware, deletePatientProfileAndAccount);
patientRouter.get("/patients-all", authMiddleware, listAllPatients);

export default patientRouter;
