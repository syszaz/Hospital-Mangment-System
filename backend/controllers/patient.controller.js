import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";

// Create Patient Profile
export const createPatientProfile = async (req, res, next) => {
  try {
    const { gender, dateOfBirth, address, medicalHistory } = req.body;

    if (!gender || !dateOfBirth || !address) {
      return res.status(400).json({ message: "Gender, Date of Birth, and Address are required" });
    }

    const existingProfile = await Patient.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Patient profile already exists" });
    }

    const newPatient = await Patient.create({
      user: req.user._id,
      gender,
      dateOfBirth,
      address,
      medicalHistory,
    });

    await newPatient.save();

    res.status(201).json({
      message: "Patient profile created successfully",
      patient: newPatient,
    });
  } catch (error) {
    next(error);
  }
};

// Update Patient Profile
export const updatePatientProfile = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const updates = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(patientId, updates, {
      new: true,
    });

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.status(200).json({
      message: "Patient profile updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Patient Profile and User Account
export const deletePatientProfileAndAccount = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await Patient.findByIdAndDelete(patientId);
    await User.findByIdAndDelete(patient.user);

    res.status(200).json({
      message: "Patient profile and user account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// List All Patients
export const listAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().populate("user", "name email");
    res.status(200).json({ patients });
  } catch (error) {
    next(error);
  }
};
