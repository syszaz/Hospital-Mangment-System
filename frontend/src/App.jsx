import React from "react";
import { useSelector } from "react-redux";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorCreateProfile from "./pages/doctor/DoctorCreateProfile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorAvailability from "./pages/doctor/DoctorAvailability";
import PatientCreateProfile from "./pages/patient/PatientCreateProfile";

const App = () => {
  const { user, token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/auth/signin" element={<Signin />} />
      <Route path="/auth/signup" element={<Signup />} />

      <Route element={<ProtectedRoute role="doctor" />}>
        <Route
          path="/doctor/create-profile"
          element={<DoctorCreateProfile />}
        />
        <Route element={<DoctorLayout />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/availability" element={<DoctorAvailability />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="patient" />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route
          path="/patient/create-profile"
          element={<PatientCreateProfile />}
        />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route
        path="/"
        element={
          token && user ? (
            !user.hasProfile ? (
              <Navigate to={`/${user.role}/create-profile`} />
            ) : (
              <Navigate to={`/${user.role}/dashboard`} />
            )
          ) : (
            <Navigate to="/auth/signin" />
          )
        }
      />

      <Route path="*" element={<h2>404 Page Not Found</h2>} />
    </Routes>
  );
};

export default App;
