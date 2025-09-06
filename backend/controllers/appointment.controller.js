import moment from "moment";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";

export const getAvailableSlot = async (req, res, next) => {
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
