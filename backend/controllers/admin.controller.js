import { Doctor } from "../models/Doctor.js";

// approve doctor
export const approveDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isApproved = true;
    await doctor.save();

    res.status(200).json({
      message: "Doctor approved successfully",
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
