import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  todayAppointments,
  getComingWeekAppointments,
  todayREvenue,
  thisWeekRevenue,
} from "../../apis/appointment";
import { getMe } from "../../apis/auth";
import { setUser } from "../../redux/slices/auth";

const DoctorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const [todatAppointments, setTodayAppointments] = useState([]);
  const [todatApprovedAppointments, setTodayApprovedAppointments] = useState(
    []
  );
  const [todatPendingAppointments, setTodayPendingAppointments] = useState([]);
  const [weeklyAssignments, setWeeklyAssignments] = useState([]);
  const [weeklyApprovedAppointments, setWeeklyApprovedAppointments] = useState(
    []
  );
  const [weeklyPendingAppointments, setWeeklyPendingAppointments] = useState(
    []
  );
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const dispatch = useDispatch();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchTodayAppointments = async () => {
    try {
      const data = await todayAppointments();
      setTodayAppointments(data.appointments || []);
      setTodayApprovedAppointments(data.approvedAppointments || []);
      setTodayPendingAppointments(data.pendingAppointments || []);
    } catch (error) {
      setError(error.message || "something went wrong");
    }
  };

  const fetchWeeklyAssignments = async () => {
    try {
      const data = await getComingWeekAppointments();
      setWeeklyAssignments(data.appointments || []);
      setWeeklyApprovedAppointments(data.approvedAppointments || []);
      setWeeklyPendingAppointments(data.pendingAppointments || []);
    } catch (error) {
      setError(error.message || "something went wrong");
    }
  };

  const fetchTodatRevenue = async () => {
    try {
      const data = await todayREvenue();
      setTodayRevenue(data.totalRevenue || 0);
    } catch (error) {
      setError(error.message || "something went wrong");
    }
  };

  const fetchThisWeekRevenue = async () => {
    try {
      const data = await thisWeekRevenue();
      setWeekRevenue(data.totalRevenue);
    } catch (error) {
      setError(error.message || "something went wrong");
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    fetchWeeklyAssignments();
    fetchTodatRevenue();
    fetchThisWeekRevenue();
  }, []);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const freshUser = await getMe();
        dispatch(setUser(freshUser));
      } catch (err) {
        console.error("Failed to refresh user", err);
      }
    };

    refreshUser();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!user?.isApproved ? (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-yellow-200 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600">Your account is not approved yet. Please wait for approval from our team.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className={`bg-gradient-to-r ${
              user.isApproved ? "from-emerald-500 to-emerald-600" : "from-yellow-400 to-yellow-500"
            } text-white rounded-xl shadow-lg p-8 mb-8`}>
            <h1 className="text-4xl font-bold mb-4">Doctor Dashboard</h1>
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="bg-white text-black bg-opacity-20 rounded-lg px-4 py-2">
                  <p className="text-sm opacity-90">Today</p>
                  <p className="font-semibold">{today}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-2 ${
                user.isApproved ? "bg-emerald-700" : "bg-yellow-600"
              } bg-opacity-50 rounded-full px-4 py-2`}>
                <div className={`w-3 h-3 ${
                  user.isApproved ? "bg-green-300" : "bg-yellow-300"
                } rounded-full`}></div>
                <span className="font-medium">
                  {user.isApproved ? "Profile Approved" : "Profile Pending Approval"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-6 h-6 bg-emerald-500 rounded mr-3"></div>
              Today's Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-500 rounded"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Appointments</h3>
                    <p className="text-4xl font-bold text-emerald-600 mb-1">
                      {todatAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Scheduled for today</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Approved</h3>
                    <p className="text-4xl font-bold text-green-600 mb-1">
                      {todatApprovedAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Confirmed appointments</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
                    <p className="text-4xl font-bold text-orange-600 mb-1">
                      {todatPendingAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Awaiting confirmation</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-6 h-6 bg-emerald-600 rounded mr-3"></div>
              Weekly Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-600 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-600 rounded"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Appointments</h3>
                    <p className="text-4xl font-bold text-emerald-600 mb-1">
                      {weeklyAssignments.length}
                    </p>
                    <p className="text-sm text-gray-500">This week</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-600 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Approved</h3>
                    <p className="text-4xl font-bold text-green-600 mb-1">
                      {weeklyApprovedAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Weekly confirmed</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-600 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-orange-600 rounded"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
                    <p className="text-4xl font-bold text-orange-600 mb-1">
                      {weeklyPendingAppointments.length}
                    </p>
                    <p className="text-sm text-gray-500">Weekly pending</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-6 h-6 bg-emerald-500 rounded mr-3"></div>
              Revenue Estimates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Revenue</h3>
                    <p className="text-3xl font-bold text-emerald-600 mb-1">
                      Rs {todayRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Estimated earnings</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-600 p-6 hover:shadow-xl transition-shadow duration-300">
                {error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Weekly Revenue</h3>
                    <p className="text-3xl font-bold text-emerald-600 mb-1">
                      Rs {weekRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">This week's earnings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;