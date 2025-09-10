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
import PatientProfile from "./pages/patient/PatientProfile";
import WaitingApproval from "./pages/doctor/WaitingApproval";

const App = () => {
  const { user, token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/auth/signin" element={<Signin />} />
      <Route path="/auth/signup" element={<Signup />} />

      <Route element={<ProtectedRoute role="doctor" />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      </Route>

      <Route path="/doctor/profile" element={<DoctorProfile />} />
      <Route path="/doctor/waiting-approval" element={<WaitingApproval />} />

      <Route element={<ProtectedRoute role="patient" />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route
        path="/"
        element={
          token && user ? (
            <Navigate to={`/${user.role}/dashboard`} />
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
