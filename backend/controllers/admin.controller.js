import { Doctor } from "../models/Doctor.js";

// approve doctor
export const approveDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if(doctor.isApproved === true) {
      return res.status(400).json({ message: "Doctor is already approved" });
    }

    doctor.isApproved = true;
    doctor.status = "approved";
    await doctor.save();

    res.status(200).json({
      message: "Doctor approved successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// not approve doctor
export const notApproveDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if(doctor.isApproved === false) {
      return res.status(400).json({ message: "Doctor is already dis-approved" });
    }

    doctor.isApproved = false;
    doctor.status = "rejected";
    await doctor.save();

    res.status(200).json({
      message: "Doctor dis-approved successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// not approved doctors list
export const getNotApprovedDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isApproved: false });
    res.status(200).json({
      message: "Not approved doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    next(error);
  }
};
