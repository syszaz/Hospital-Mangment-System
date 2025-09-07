import moment from "moment";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";

// book an appointment with a doctor
export const bookAppointment = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { date, reason } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const selectedDate = moment(date).startOf("day");
    const today = moment().startOf("day");

    if (selectedDate.isBefore(today)) {
      return res
        .status(400)
        .json({ message: "Cannot book appointment for past dates" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isApproved) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const alreadyBooked = await Appointment.findOne({
      doctor: doctorId,
      patient: patientId,
      date: selectedDate.toDate(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: "You have already booked an appointment on this date",
      });
    }

    const dayOfWeek = selectedDate.format("dddd");

    if (doctor.daysOff.some((day) => moment(day).isSame(selectedDate, "day"))) {
      return res.status(400).json({ message: "Doctor is off on this date" });
    }

    const availability = doctor.availability.find((d) => d.day === dayOfWeek);
    if (!availability) {
      return res
        .status(400)
        .json({ message: `Doctor is not available on ${dayOfWeek}s` });
    }

    const bookedCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: selectedDate.toDate(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (bookedCount >= availability.maxPatientsPerDay) {
      return res
        .status(400)
        .json({ message: "No slots available on this date" });
    }

    let newAppointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      date: selectedDate.toDate(),
      reason,
      status: "pending",
      startTime: availability.startTime,
      endTime: availability.endTime,
    });

    newAppointment = await Appointment.findById(newAppointment._id)
      .populate({
        path: "doctor",
        select: "specialization",
        populate: { path: "user", select: "name email" },
      })
      .populate("patient", "name email");

    res.status(201).json({
      success: true,
      message:
        "Appointment booked successfully, waiting for doctors confirmation",
      appointment: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// update date of an appointment
export const updateAppointmentDate = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const { newDate } = req.body;
    const patientId = req.user._id;

    if (!newDate) {
      return res.status(400).json({ message: "New date is required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.patient.toString() !== patientId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this appointment" });
    }
    if (appointment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending appointments can be updated" });
    }

    const selectedDate = moment(newDate).startOf("day");
    const today = moment().startOf("day");

    if (selectedDate.isBefore(today)) {
      return res
        .status(400)
        .json({ message: "Cannot book appointment for past dates" });
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor || !doctor.isApproved) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const alreadyBooked = await Appointment.findOne({
      doctor: appointment.doctor,
      patient: patientId,
      date: selectedDate.toDate(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: "You have already booked an appointment on this date",
      });
    }

    const dayOfWeek = selectedDate.format("dddd");

    if (doctor.daysOff.some((day) => moment(day).isSame(selectedDate, "day"))) {
      return res.status(400).json({ message: "Doctor is off on this date" });
    }

    const availability = doctor.availability.find((d) => d.day === dayOfWeek);
    if (!availability) {
      return res
        .status(400)
        .json({ message: `Doctor is not available on ${dayOfWeek}s` });
    }

    const bookedCount = await Appointment.countDocuments({
      doctor: appointment.doctor,
      date: selectedDate.toDate(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (bookedCount >= availability.maxPatientsPerDay) {
      return res
        .status(400)
        .json({ message: "No slots available on this date" });
    }

    appointment.date = selectedDate.toDate();
    appointment.startTime = availability.startTime;
    appointment.endTime = availability.endTime;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment date updated successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// delete an appointment
export const deleteAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const patientId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.patient.toString() !== patientId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this appointment" });
    }
    if (appointment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending appointments can be deleted" });
    }

    await appointment.remove();

    res
      .status(200)
      .json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
