import React, { useEffect, useState } from "react";
import { FaUser, FaLock, FaUserMd } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiUserSettingsFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../redux/slices/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      if (user.role === "doctor") {
        navigate("/doctor/profile");
      } else if (user.role === "patient") {
        navigate("/patient/profile");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Username is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is not valid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^((\+92)|0)3[0-5][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone =
        "Enter a valid Pakistan phone number (e.g., 03001234567 or +923001234567)";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    dispatch(signupUser(formData));
    console.log(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 my-0.5">
            Sign Up
          </h2>
          <p className="text-gray-500 font-bold">
            Join us today! Create an account to get started.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 border border-red-400 rounded p-2 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaUser className="text-gray-400 text-lg mr-2" />
              <input
                name="name"
                autoComplete="off"
                type="text"
                placeholder="Username"
                className="w-full outline-none text-gray-700"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <MdEmail className="text-gray-400 text-lg mr-2" />
              <input
                name="email"
                autoComplete="off"
                type="email"
                placeholder="Email"
                className="w-full outline-none text-gray-700"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaLock className="text-gray-400 text-lg mr-2" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full outline-none text-gray-700"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaLock className="text-gray-400 text-lg mr-2" />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="w-full outline-none text-gray-700"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <RiUserSettingsFill className="text-gray-400 text-lg mr-2" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full outline-none text-gray-700 bg-transparent">
                <option value="" disabled>
                  Select Role
                </option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaUser className="text-gray-400 text-lg mr-2" />
              <input
                name="phone"
                autoComplete="off"
                type="text"
                placeholder="Phone Number"
                className="w-full outline-none text-gray-700"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold shadow-md ${
              loading && "bg-emerald-300"
            }`}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?
          <a
            href="/auth/signin"
            className="text-emerald-500 px-1 font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
