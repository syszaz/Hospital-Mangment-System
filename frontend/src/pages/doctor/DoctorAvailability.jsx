import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchUserProfileByEmail } from "../../apis/user";
import { updateProfessionalInfo } from "../../apis/doctor";

const DoctorAvailability = () => {
  const { user } = useSelector((state) => state.auth);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    weeklySchedule: {
      Monday: { isActive: false, slots: [] },
      Tuesday: { isActive: false, slots: [] },
      Wednesday: { isActive: false, slots: [] },
      Thursday: { isActive: false, slots: [] },
      Friday: { isActive: false, slots: [] },
      Saturday: { isActive: false, slots: [] },
      Sunday: { isActive: false, slots: [] },
    },
    daysOff: [],
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const formatTimeTo12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const editingAvailability = () => {
    const weeklySchedule = {
      Monday: { isActive: false, slots: [] },
      Tuesday: { isActive: false, slots: [] },
      Wednesday: { isActive: false, slots: [] },
      Thursday: { isActive: false, slots: [] },
      Friday: { isActive: false, slots: [] },
      Saturday: { isActive: false, slots: [] },
      Sunday: { isActive: false, slots: [] },
    };

    if (doctorProfile.availability) {
      doctorProfile.availability.forEach((slot) => {
        if (weeklySchedule[slot.day]) {
          weeklySchedule[slot.day].isActive = true;
          weeklySchedule[slot.day].slots.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxPatientsPerDay: slot.maxPatientsPerDay || 10,
          });
        }
      });
    }

    setAvailabilityForm({
      weeklySchedule,
      daysOff: doctorProfile.daysOff || [],
    });
    setIsEditing(true);
  };

  const toggleDayActive = (day) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          isActive: !prev.weeklySchedule[day].isActive,
          slots: !prev.weeklySchedule[day].isActive
            ? prev.weeklySchedule[day].slots.length === 0
              ? [
                  {
                    startTime: "09:00",
                    endTime: "17:00",
                    maxPatientsPerDay: 10,
                  },
                ]
              : prev.weeklySchedule[day].slots
            : prev.weeklySchedule[day].slots,
        },
      },
    }));
  };

  const addTimeSlot = (day) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: [
            ...prev.weeklySchedule[day].slots,
            { startTime: "09:00", endTime: "17:00", maxPatientsPerDay: 10 },
          ],
        },
      },
    }));
  };

  const removeTimeSlot = (day, slotIndex) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: prev.weeklySchedule[day].slots.filter(
            (_, index) => index !== slotIndex
          ),
        },
      },
    }));
  };

  const updateTimeSlot = (day, slotIndex, field, value) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: prev.weeklySchedule[day].slots.map((slot, index) =>
            index === slotIndex ? { ...slot, [field]: value } : slot
          ),
        },
      },
    }));
  };

  const duplicateToOtherDays = (sourceDay) => {
    const sourceSlots = availabilityForm.weeklySchedule[sourceDay].slots;
    setAvailabilityForm((prev) => {
      const newWeeklySchedule = { ...prev.weeklySchedule };
      daysOfWeek.forEach((day) => {
        if (day !== sourceDay && newWeeklySchedule[day].isActive) {
          newWeeklySchedule[day].slots = [...sourceSlots];
        }
      });
      return { ...prev, weeklySchedule: newWeeklySchedule };
    });
  };

  const handleDaysOffChange = (day) => {
    const newDaysOff = availabilityForm.daysOff.includes(day)
      ? availabilityForm.daysOff.filter((d) => d !== day)
      : [...availabilityForm.daysOff, day];

    setAvailabilityForm({ ...availabilityForm, daysOff: newDaysOff });
  };

  const handleSaveAvailability = async () => {
    try {
      const availability = [];
      Object.entries(availabilityForm.weeklySchedule).forEach(
        ([day, dayData]) => {
          if (dayData.isActive) {
            dayData.slots.forEach((slot) => {
              availability.push({
                day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxPatientsPerDay: slot.maxPatientsPerDay,
              });
            });
          }
        }
      );

      const updateData = {
        availability,
        daysOff: availabilityForm.daysOff,
      };

      const updated = await updateProfessionalInfo(
        doctorProfile._id,
        updateData
      );

      setDoctorProfile(updated.doctor);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update availability info");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.email) {
          const profileData = await fetchUserProfileByEmail(user.email);
          setDoctorProfile(profileData.doctorProfile);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-pulse flex space-x-4">
            <div className="w-12 h-12 bg-emerald-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
              <div className="h-3 bg-emerald-100 rounded w-1/2"></div>
            </div>
          </div>
          <p className="text-emerald-600 mt-4 text-center">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-red-500 rounded"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Error Loading Availability
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg mr-3"></div>
              Doctor Availability
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your weekly schedule and availability
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => editingAvailability()}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Edit Availability
            </button>
          )}
        </div>

        {doctorProfile ? (
          <div className="space-y-8">
            {!isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  {doctorProfile?.availability &&
                  doctorProfile.availability.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg border-l-4 border-purple-500 p-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-purple-500 rounded mr-3"></div>
                        Weekly Schedule
                      </h2>
                      <div className="grid gap-4">
                        {daysOfWeek.map((day) => {
                          const daySlots = doctorProfile.availability.filter(
                            (slot) => slot.day === day
                          );
                          const isDayOff =
                            doctorProfile.daysOff &&
                            doctorProfile.daysOff.includes(day);

                          return (
                            <div
                              key={day}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    isDayOff
                                      ? "bg-red-500"
                                      : daySlots.length > 0
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}></div>
                                <span className="font-medium text-gray-800 w-24">
                                  {day}
                                </span>
                              </div>
                              <div className="flex-1 ml-8">
                                {isDayOff ? (
                                  <div className="flex items-center">
                                    <span className="text-red-600 text-sm px-3 font-medium">
                                      Day Off - Doctor Not Available
                                    </span>
                                  </div>
                                ) : daySlots.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {daySlots.map((slot, index) => (
                                      <div
                                        key={index}
                                        className="bg-white px-3 py-1 rounded-md border border-gray-200">
                                        <span className="text-sm text-gray-700">
                                          {formatTimeTo12Hour(slot.startTime)} -{" "}
                                          {formatTimeTo12Hour(slot.endTime)}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                          (Max {slot.maxPatientsPerDay})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic">
                                    Not available
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No Schedule Set
                      </h3>
                      <p className="text-gray-600">
                        Click "Edit Availability" to set your weekly schedule.
                      </p>
                    </div>
                  )}

                  {doctorProfile?.daysOff &&
                    doctorProfile.daysOff.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-6 mt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <div className="w-6 h-6 bg-red-500 rounded mr-3"></div>
                          Days Off
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {doctorProfile.daysOff.map((day, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Days</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {doctorProfile?.availability?.reduce((acc, slot) => {
                            if (!acc.includes(slot.day)) acc.push(slot.day);
                            return acc;
                          }, [])?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Time Slots</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {doctorProfile?.availability?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Days Off</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {doctorProfile?.daysOff?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Edit Weekly Schedule
                  </h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveAvailability}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Save Schedule
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={
                              availabilityForm.weeklySchedule[day].isActive
                            }
                            onChange={() => toggleDayActive(day)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-lg font-semibold text-gray-800">
                            {day}
                          </label>
                          {availabilityForm.daysOff.includes(day) && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Day Off
                            </span>
                          )}
                        </div>
                        {availabilityForm.weeklySchedule[day].isActive && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => addTimeSlot(day)}
                              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                              Add Slot
                            </button>
                            <button
                              onClick={() => duplicateToOtherDays(day)}
                              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                              Duplicate to Active Days
                            </button>
                          </div>
                        )}
                      </div>

                      {availabilityForm.weeklySchedule[day].isActive && (
                        <div className="space-y-2 ml-8">
                          {availabilityForm.weeklySchedule[day].slots.length ===
                          0 ? (
                            <p className="text-gray-500 italic">
                              No time slots added yet
                            </p>
                          ) : (
                            availabilityForm.weeklySchedule[day].slots.map(
                              (slot, slotIndex) => (
                                <div
                                  key={slotIndex}
                                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) =>
                                      updateTimeSlot(
                                        day,
                                        slotIndex,
                                        "startTime",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                  />
                                  <span className="text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) =>
                                      updateTimeSlot(
                                        day,
                                        slotIndex,
                                        "endTime",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                  />
                                  <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600">
                                      Max patients:
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="50"
                                      value={slot.maxPatientsPerDay}
                                      onChange={(e) =>
                                        updateTimeSlot(
                                          day,
                                          slotIndex,
                                          "maxPatientsPerDay",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeTimeSlot(day, slotIndex)
                                    }
                                    className="text-red-500 hover:text-red-700 p-1">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Days Off (General)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                      <label key={day} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={availabilityForm.daysOff.includes(day)}
                          onChange={() => handleDaysOffChange(day)}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {day}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select days that you're generally not available
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Profile Found
            </h3>
            <p className="text-gray-600">
              Unable to load your availability information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailability;
