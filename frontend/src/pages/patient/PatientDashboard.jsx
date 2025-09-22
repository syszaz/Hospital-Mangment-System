import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { nextAppointments } from "../../apis/patient";

const PatientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchUpComingThreeAppointments = async () => {
    try {
      const res = await nextAppointments();
      if (res.success) {
        setAppointments(res.nextAppointments || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpComingThreeAppointments();
  }, [user]);

  return (
    <div className="p-6">
      <div
        className={`bg-gradient-to-r from-emerald-500 to-emerald-600
        } text-white rounded-xl shadow-lg p-8 mb-8`}>
        <h1 className="text-4xl font-bold mb-4">Patient Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="bg-white text-black bg-opacity-20 rounded-lg px-4 py-2">
              <p className="text-sm opacity-90">Today</p>
              <p className="font-semibold">{today}</p>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : appointments.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-6 h-6 bg-emerald-500 rounded mr-3"></div>
            Next Three Appointments
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white shadow-lg rounded-lg border-l-4 border-emerald-300 p-5 hover:shadow-lg transition">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-emerald-600">
                    {appt.doctor?.user?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {appt.doctor?.user?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appt.doctor?.user?.phone}
                  </p>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(appt.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {appt.startTime}{" "}
                    - {appt.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Reason:</span> {appt.reason}
                  </p>
                  <p>
                    <span className="font-medium">Fee:</span> Rs.{" "}
                    {appt.doctor?.consultationFee}
                  </p>
                </div>
                <p
                  className={`mt-3 text-sm font-semibold ${
                    appt.status === "confirmed"
                      ? "text-emerald-600"
                      : appt.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                  Status: {appt.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No upcoming appointments found.</p>
      )}
    </div>
  );
};

export default PatientDashboard;
