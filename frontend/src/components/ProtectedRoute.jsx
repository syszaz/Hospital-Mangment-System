import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role === "doctor") {
    if (!user.hasProfile) {
      return <Navigate to="/doctor/profile" replace />;
    }
    if (!user.isApproved === "approved") {
      return <Navigate to="/doctor/waiting-approval" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
