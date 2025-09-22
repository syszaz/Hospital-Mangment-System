import React from "react";
import { useSelector } from "react-redux";
import { Outlet, NavLink, Navigate } from "react-router-dom";

const PatientLayout = () => {
  const { user } = useSelector((state) => state.auth);
  
  if (user.role === "patient" && !user.hasProfile) {
    return <Navigate to="/patient/create-profile" />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-2xl">
        <div className="p-6 border-b border-emerald-500 border-opacity-30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Patient Portal</h2>
              <p className="text-emerald-200 text-sm opacity-90">Patient Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-6">
          <div className="space-y-2">
            <NavLink
              to="/patient/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white hover:bg-opacity-10 group ${
                  isActive 
                    ? "bg-white text-emerald-500 bg-opacity-20 font-semibold shadow-lg" 
                    : "text-emerald-100 hover:text-emerald-500"
                }`
              }
            >
              <div className="w-6 h-6 bg-current opacity-70 rounded group-hover:opacity-100"></div>
              <span className="font-medium">Dashboard</span>
            </NavLink>

            <NavLink
              to="/patient/appointments"
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white hover:bg-opacity-10 group ${
                  isActive 
                    ? "bg-white bg-opacity-20 text-emerald-500 font-semibold shadow-lg" 
                    : "text-emerald-100 hover:text-emerald-500"
                }`
              }
            >
              <div className="w-6 h-6 bg-current opacity-70 rounded-full group-hover:opacity-100"></div>
              <span className="font-medium">Appointments</span>
            </NavLink>

            <NavLink
              to="/patient/find-doctors"
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white hover:bg-opacity-10 group ${
                  isActive 
                    ? "bg-white bg-opacity-20 text-emerald-500 font-semibold shadow-lg" 
                    : "text-emerald-100 hover:text-emerald-500"
                }`
              }
            >
              <div className="w-6 h-6 bg-current opacity-70 rounded group-hover:opacity-100"></div>
              <span className="font-medium">Find Doctors</span>
            </NavLink>

            <NavLink
              to="/patient/profile"
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white hover:bg-opacity-10 group ${
                  isActive 
                    ? "bg-white bg-opacity-20 text-emerald-500 font-semibold shadow-lg" 
                    : "text-emerald-100 hover:text-emerald-500"
                }`
              }
            >
              <div className="w-6 h-6 bg-current opacity-70 rounded-full group-hover:opacity-100"></div>
              <span className="font-medium">Profile</span>
            </NavLink>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-opacity-30 w-fit">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white bg-opacity-60 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Doctor'}
              </p>
              <p className="text-xs text-emerald-200 opacity-75">
                {user?.email || 'doctor@example.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;