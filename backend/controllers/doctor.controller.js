import moment from "moment";
import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { sendEmail } from "../utils/sendEmail.js";

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

    const doctorUser = await User.findById(req.user._id);

    await sendEmail({
      to: doctorUser.email,
      subject: "Profile Created - Pending Approval",
      html: `
        <h2>Hi ${doctorUser.name},</h2>
        <p>Your doctor profile has been created successfully.</p>
        <p>Status: <b>Pending Approval</b></p>
        <p>We’ll notify you once it’s approved by the admin.</p>
      `,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Doctor Profile Awaiting Approval",
      html: `
        <h2>New Doctor Registration</h2>
        <p><b>Name:</b> ${doctorUser.name}</p>
        <p><b>Email:</b> ${doctorUser.email}</p>
        <p><b>Specialization:</b> ${specialization}</p>
        <p>Please review and approve/reject this profile in the admin panel.</p>
      `,
    });

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
    if (doctorId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
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

    if (doctorId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
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

    await sendEmail({
      to: appointment.patient.email,
      subject: "Your Appointment is Confirmed",
      html: `
        <h2>Hello ${appointment.patient.name},</h2>
        <p>Your appointment with Dr. ${
          appointment.doctor.user.name
        } has been <b>confirmed</b>.</p>
        <p><b>Date:</b> ${appointment.date.toDateString()}</p>
        <p><b>Time:</b> ${appointment.startTime} - ${appointment.endTime}</p>
        <p>Please make sure to arrive on time.</p>
        <p>Regards,<br/>Healthcare Platform Team</p>
      `,
    });

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

    await sendEmail({
      to: appointment.patient.email,
      subject: "Your Appointment is Cancelled",
      html: `
        <h2>Hello ${appointment.patient.name},</h2>
        <p>Your appointment with Dr. ${
          appointment.doctor.user.name
        } has been <b>cancelled</b>.</p>
        <p><b>Date:</b> ${appointment.date.toDateString()}</p>
        <p>If this is a mistake, please try booking again.</p>
        <p>Regards,<br/>Healthcare Platform Team</p>
      `,
    });
    
    res
      .status(200)
      .json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    next(error);
  }
};
