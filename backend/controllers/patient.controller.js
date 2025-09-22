import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
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
    const userId = req.params.id;
    const { gender, dateOfBirth, address, medicalHistory } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (userId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this profile" });
    }

    const updates = {};
    if (gender) updates.gender = gender;
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (address) updates.address = address;
    if (medicalHistory) updates.medicalHistory = medicalHistory;

    const updatedPatient = await Patient.findOneAndUpdate(
      { user: userId },
      updates,
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const updatedUser = await User.findById(userId);

    res.status(200).json({
      message: "Patient profile updated successfully",
      user: updatedUser,
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
export const listAllPatients = async (_req, res, next) => {
  try {
    const patients = await Patient.find().populate("user", "name email");
    res.status(200).json({ patients });
  } catch (error) {
    next(error);
  }
};

// get patient by id
export const getPatientByID = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const patientDoc = await Patient.findById(patientId).populate(
      "user",
      "name email phone"
    );

    if (!patientDoc) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const appointments = await Appointment.find({
      patient: patientId,
      doctor: doctorProfile._id,
    })
      .populate("doctor")
      .sort({ date: -1 });

    const patientData = {
      _id: patientDoc._id,
      name: patientDoc.user?.name,
      email: patientDoc.user?.email,
      phone: patientDoc.user?.phone,
      gender: patientDoc.gender,
      dateOfBirth: patientDoc.dateOfBirth,
      address: patientDoc.address,
      medicalHistory: patientDoc.medicalHistory || [],
      lastAppointment: appointments[0]?.date || null,
      totalVisits: appointments.length,
      appointmentHistory: appointments.map((appt) => ({
        _id: appt._id,
        date: appt.date,
        reason: appt.reason,
        status: appt.status,
        startTime: appt.startTime,
        endTime: appt.endTime,
        doctor: appt.doctor,
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Patient details fetched successfully",
      patient: patientData,
    });
  } catch (error) {
    next(error);
  }
};

// next appointment for the patient
export const nextAppointments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user id not found",
      });
    }

    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const comingAppointments = await Appointment.find({
      patient: patient._id,
      date: { $gte: new Date() },
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email phone role",
        },
        select: "specialty experience consultationFee",
      })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email phone role",
        },
        select: "gender dateOfBirth address",
      })
      .sort({ date: 1 });

      const threeAppointments = comingAppointments.slice(0, 3);

    return res.status(200).json({
      success: true,
      nextAppointments: threeAppointments || null,
    });
  } catch (error) {
    next(error);
  }
};
