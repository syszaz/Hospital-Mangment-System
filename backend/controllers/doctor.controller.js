import moment from "moment";
import { Doctor } from "../models/Doctor.js";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { Appointment } from "../models/Appointment.js";
import { sendEmail } from "../utils/sendEmail.js";

const DAYS_MAP = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const parseAvailability = (text) => {
  const slots = [];
  const entries = text.split(";").map((e) => e.trim());

  for (let entry of entries) {
    const [daysPart, timePart] = entry.split(" ");
    if (!daysPart || !timePart) continue;

    const [startTime, endTime] = timePart.split("-");
    if (!startTime || !endTime) continue;

    let days = [];
    if (daysPart.includes("-")) {
      const [startDay, endDay] = daysPart.split("-");
      const dayKeys = Object.keys(DAYS_MAP);
      const startIndex = dayKeys.indexOf(startDay.toLowerCase());
      const endIndex = dayKeys.indexOf(endDay.toLowerCase());
      if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex) {
        days = dayKeys.slice(startIndex, endIndex + 1).map((d) => DAYS_MAP[d]);
      }
    } else {
      const day = DAYS_MAP[daysPart.toLowerCase()];
      if (day) days.push(day);
    }

    days.forEach((day) => slots.push({ day, startTime, endTime }));
  }

  return slots;
};

// create doctor profile
export const createDoctorProfile = async (req, res, next) => {
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

    const structuredAvailability = parseAvailability(availability);

    if (structuredAvailability.length === 0) {
      return res.status(400).json({ message: "Invalid availability format" });
    }

    const selectedDays = structuredAvailability.map((slot) => slot.day);
    const daysOff = ALL_DAYS.filter((d) => !selectedDays.includes(d));

    const newDoctor = new Doctor({
      user: req.user._id,
      specialization,
      experience,
      consultationFee,
      clinicAddress,
      availability: structuredAvailability,
      daysOff,
    });

    await newDoctor.save();

    sendEmail({
      to: req.user.email,
      subject: "Doctor Profile Created",
      html: `<p>Your doctor profile is created and pending approval.</p>`,
    }).catch((err) => console.error("Email failed:", err));

    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor: newDoctor,
    });
  } catch (err) {
    next(err);
  }
};

// update doctor profile
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const updates = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updates, {
      new: true,
    });

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

