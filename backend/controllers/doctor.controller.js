import moment from "moment";
import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";

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

// list doctors with filters
export const listDoctorsWithFilters = async (req, res, next) => {
  try {
    const { specialization, minFee, maxFee, minExperience, maxExperience } =
      req.query;

    let filter = { isApproved: true };

    if (specialization) {
      filter.specialization = specialization;
    }

    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
    }

    if (minExperience || maxExperience) {
      filter.experience = {};
      if (minExperience) filter.experience.$gte = Number(minExperience);
      if (maxExperience) filter.experience.$lte = Number(maxExperience);
    }

    const doctors = await Doctor.find(filter).populate("user", "name email");

    res.status(200).json({ message: "doctors find successful", doctors });
  } catch (error) {
    next(error);
  }
};

// get available seats for a doctor on a specific date
export const getAvailableSeatsForDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const date = req.query.date;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const selectedDate = moment(date).startOf("day");
    const dayOfWeek = selectedDate.format("dddd");

    if (doctor.daysOff.some((d) => moment(d).isSame(selectedDate, "day"))) {
      return res.status(200).json({
        success: true,
        message: "Doctor is off on this date",
        slots: [],
      });
    }

    const availability = doctor.availability.find((a) => a.day === dayOfWeek);
    if (!availability) {
      return res.status(200).json({
        success: true,
        message: `Doctor is not available on ${dayOfWeek}s`,
        slots: [],
      });
    }

    const bookedCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: selectedDate.toDate(),
      status: { $in: ["pending", "confirmed"] },
    });

    const remainingSeats = availability.maxPatientsPerDay - bookedCount;

    res.status(200).json({
      success: true,
      message: "Available slots fetched successfully",
      slots:
        remainingSeats > 0
          ? [
              {
                date: selectedDate.toDate(),
                day: dayOfWeek,
                startTime: availability.startTime,
                endTime: availability.endTime,
                remainingSeats,
              },
            ]
          : [],
    });
  } catch (error) {
    next(error);
  }
};

// approve an appointment of a patient
export const approveAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending appointments can be approved" });
    }
    appointment.status = "confirmed";
    await appointment.save();
    res
      .status(200)
      .json({ message: "Appointment approved successfully", appointment });
  } catch (error) {
    next(error);
  }
};

// cancel an appointment of a patient
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Appointment is already cancelled" });
    }
    appointment.status = "cancelled";
    await appointment.save();
    res
      .status(200)
      .json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    next(error);
  }
};
