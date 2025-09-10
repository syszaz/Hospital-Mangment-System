import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// Create Patient Profile
export const createPatientProfile = async (req, res, next) => {
  try {
    const { gender, dateOfBirth, address, medicalHistory } = req.body;

    if (!gender || !dateOfBirth || !address) {
      return res
        .status(400)
        .json({ message: "Gender, Date of Birth, and Address are required" });
    }

    const existingProfile = await Patient.findOne({ user: req.user._id });
    if (existingProfile) {
      return res
        .status(400)
        .json({ message: "Patient profile already exists" });
    }

    const newPatient = await Patient.create({
      user: req.user._id,
      gender,
      dateOfBirth,
      address,
      medicalHistory,
    });

    await newPatient.save();

    const user = req.user;

    sendEmail({
      to: user.email,
      subject: "Patient Profile Created",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>Your patient profile has been created successfully.</p>
        <p>You can now book appointments with doctors and manage your medical history through our platform.</p>
        <p>Regards,<br/>Healthcare Platform Team</p>
      `,
    })
      .then((result) => {
        if (result.error || !result.success) {
          console.error("Email send failed:", result.error);
        }
      })
      .catch((err) => {
        console.error("Email error:", err);
      });

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

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    if (patientId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this profile" });
    }

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

    if (patientId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this profile" });
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
