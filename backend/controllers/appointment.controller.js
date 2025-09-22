import moment from "moment";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { Appointment } from "../models/Appointment.js";
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";

// book an appointment with a doctor
export const bookAppointment = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { date, reason } = req.body;
    const userId = req.user._id;
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

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
      patient: patient._id,
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
      patient: patient._id,
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
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email phone" },
      });

    const patientUser = newAppointment.patient?.user;
    const doctorUser = newAppointment.doctor?.user;

    if (patientUser?.email && doctorUser?.name) {
      sendEmail({
        to: patientUser.email,
        subject: "Your Appointment Request is Pending",
        html: `
      <h2>Hello ${patientUser.name},</h2>
      <p>Your appointment request has been received and is <b>waiting for doctor's approval</b>.</p>
      <p><b>Doctor:</b> Dr. ${doctorUser.name} (${
          newAppointment.doctor.specialization
        })</p>
      <p><b>Date:</b> ${newAppointment.date.toDateString()}</p>
      <p><b>Time:</b> ${newAppointment.startTime} - ${
          newAppointment.endTime
        }</p>
      <p>We will notify you once the doctor confirms your appointment.</p>
      <p>Regards,<br/>Healthcare Platform Team</p>
    `,
      })
        .then(() => {
          console.log("Appointment email sent successfully");
        })
        .catch((error) => {
          console.error("Error sending appointment email:", error);
        });
    } else {
      console.warn("Missing patient or doctor details, skipping email send");
    }

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

// get all Appointments for a doctor
export const getAllAppointments = async (req, res, next) => {
  try {
    const doctorID = req.params.id;
    const { status } = req.query;
    if (!doctorID) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorID)) {
      return res.status(400).json({ message: "Invalid doctor ID format" });
    }

    const doctor = await Doctor.findById(doctorID);
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const query = { doctor: doctorID };
    if (status && status !== "all") {
      query.status = status;
    }

    const startOfToday = moment().startOf("day").toDate();
    query.date = { $gte: startOfToday };

    const appointments = await Appointment.find(query)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      message: `${query?.status || "all"} appintments fetched succeessful`,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// approve an appointment of a patient
export const approveAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "confirmed";
    await appointment.save();

    sendEmail({
      to: appointment.patient.user.email,
      subject: "Your Appointment is Confirmed",
      html: `
    <h2>Hello ${appointment.patient.user.name},</h2>
    <p>Your appointment with Dr. ${
      appointment.doctor.user.name
    } has been <b>confirmed</b>.</p>
    <p><b>Date:</b> ${appointment.date.toDateString()}</p>
    <p><b>Time:</b> ${appointment.startTime} - ${appointment.endTime}</p>
    <p>Please make sure to arrive on time.</p>
    <p>Regards,<br/>Healthcare Platform Team</p>
  `,
    })
      .then(() => {
        console.log("Confirmation email sent successfully");
      })
      .catch((err) => {
        console.error("Failed to send confirmation email:", err);
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
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      });

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

    sendEmail({
      to: appointment.patient.user.email,
      subject: "Your Appointment is Confirmed",
      html: `
    <h2>Hello ${appointment.patient.user.name},</h2>
    <p>Your appointment with Dr. ${
      appointment.doctor.user.name
    } has been <b>confirmed</b>.</p>
    <p><b>Date:</b> ${appointment.date.toDateString()}</p>
    <p><b>Time:</b> ${appointment.startTime} - ${appointment.endTime}</p>
    <p>Please make sure to arrive on time.</p>
    <p>Regards,<br/>Healthcare Platform Team</p>
  `,
    })
      .then(() => {
        console.log("Confirmation email sent successfully");
      })
      .catch((err) => {
        console.error("Failed to send confirmation email:", err);
      });

    res
      .status(200)
      .json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    next(error);
  }
};

// mark an appointment as completed
export const completeAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status === "completed") {
      return res
        .status(400)
        .json({ message: "Appointment is already completed" });
    }
    appointment.status = "completed";
    await appointment.save();

    res
      .status(200)
      .json({ message: "Appointment completed successfully", appointment });
  } catch (error) {
    next(error);
  }
};

// appointments for today
export const getTodaysAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("patient", "name email")
      .sort({ startTime: 1 });

    const approvedAppointments = appointments.filter(
      (appt) => appt.status === "confirmed"
    );
    const pendingAppointments = appointments.filter(
      (appt) => appt.status === "pending"
    );

    res.status(200).json({
      message: "Today's appointments fetched successfully",
      appointments,
      approvedAppointments,
      pendingAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// upcoming week appointments
export const getUpcomingWeekAppointments = async (req, res, next) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const startOfDay = moment().startOf("day").toDate();
    const endOfWeek = moment().endOf("week").endOf("day").toDate();

    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
      date: { $gte: startOfDay, $lte: endOfWeek },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("patient", "name email")
      .sort({ date: 1, startTime: 1 });

    const approvedAppointments = appointments.filter(
      (appt) => appt.status === "confirmed"
    );
    const pendingAppointments = appointments.filter(
      (appt) => appt.status === "pending"
    );

    res.status(200).json({
      message: "Upcoming week appointments fetched successfully",
      appointments,
      approvedAppointments,
      pendingAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// get monthly appointments
export const getMonthlyAppointments = async (req, res, next) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").endOf("day").toDate();

    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("patient", "name email")
      .sort({ date: 1, startTime: 1 });

    const approvedAppointments = appointments.filter(
      (appt) => appt.status === "confirmed"
    );
    const pendingAppointments = appointments.filter(
      (appt) => appt.status === "pending"
    );

    res.status(200).json({
      message: "Monthly appointments fetched successfully",
      appointments,
      approvedAppointments,
      pendingAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// revenue estimate for the doctor for today
export const getTodaysRevenueEstimate = async (req, res, next) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: "confirmed",
    });

    const totalRevenue = appointments.reduce(
      (sum, appt) => sum + doctorProfile.consultationFee,
      0
    );

    res.status(200).json({
      message: "Today's revenue estimate fetched successfully",
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// revenue for this week
export const revenueForThisWeek = async (req, res, next) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const startOfDay = moment().startOf("day").toDate();
    const endOfWeek = moment().endOf("week").endOf("day").toDate();

    const appointments = await Appointment.find({
      doctor: doctorProfile._id,
      date: { $gte: startOfDay, $lte: endOfWeek },
      status: "confirmed",
    });

    const totalRevenue = appointments.reduce(
      (sum, appt) => sum + doctorProfile.consultationFee,
      0
    );

    res.status(200).json({
      message: "this week's revenue estimate fetched successfully",
      totalRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// get all patients for the doctor
export const getDoctorPatients = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    const doctorProfile = await Doctor.findOne({ user: userId });
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const doctorId = doctorProfile._id;

    const appointments = await Appointment.find({
      doctor: doctorId,
    })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .sort({ date: -1 });

    if (!appointments.length) {
      return res.status(200).json({ patients: [] });
    }

    const patientMap = {};

    for (let appt of appointments) {
      const patientDoc = appt.patient;
      const userDoc = patientDoc?.user;

      if (!patientDoc || !userDoc) continue;

      if (!patientMap[patientDoc._id]) {
        patientMap[patientDoc._id] = {
          _id: patientDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          phone: userDoc.phone,
          gender: patientDoc.gender,
          dateOfBirth: patientDoc.dateOfBirth,
          address: patientDoc.address,
          medicalHistory: patientDoc.medicalHistory || [],
          lastAppointment: appt.date,
          totalVisits: 1,
          appointmentHistory: [
            {
              date: appt.date,
              reason: appt.reason,
              status: appt.status,
              startTime: appt.startTime,
              endTime: appt.endTime,
            },
          ],
        };
      } else {
        patientMap[patientDoc._id].totalVisits += 1;

        if (appt.date > patientMap[patientDoc._id].lastAppointment) {
          patientMap[patientDoc._id].lastAppointment = appt.date;
        }

        patientMap[patientDoc._id].appointmentHistory.push({
          date: appt.date,
          reason: appt.reason,
          status: appt.status,
          startTime: appt.startTime,
          endTime: appt.endTime,
        });
      }
    }

    res.json({ patients: Object.values(patientMap) });
  } catch (error) {
    next(error);
  }
};
