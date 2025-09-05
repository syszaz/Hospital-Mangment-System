import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";

// create doctor profile
export const createDocotorProfile = async (req, res, next) => {
  try {
    const {
      specialization,
      experience,
      consultationFee,
      clinicAddress,
      availability,
    } = req.body;
    if (
      !specialization ||
      !experience ||
      !consultationFee ||
      !clinicAddress ||
      !availability
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingProfile = await Doctor.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Doctor profile already exists" });
    }
    const newDoctor = new Doctor({
      user: req.user._id,
      specialization,
      experience,
      consultationFee,
      clinicAddress,
      availability,
    });
    await newDoctor.save();
    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// update doctor profile
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const updates = req.body;
    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updates, {
      new: true,
    });
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// delete doctor profile and user account
export const deleteDoctorProfileAndAccount = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    await Doctor.findByIdAndDelete(doctorId);
    await User.findByIdAndDelete(doctor.user);

    res.status(200).json({
      message: "Doctor profile and user account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// list all doctors
export const listAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isApproved: true }).populate(
      "user",
      "name email"
    );
    res.status(200).json({ doctors });
  } catch (error) {
    next(error);
  }
};
