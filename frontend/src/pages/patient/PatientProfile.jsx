import React, { useEffect, useState } from "react";
import { FaUserMd, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { RiGenderlessLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPatientProfile } from "../../apis/patient";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    gender: "",
    dateOfBirth: "",
    address: "",
    medicalHistory: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "patient") {
        navigate("/patient/dashboard");
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of Birth is required";
    if (!formData.address) newErrors.address = "Address is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await createPatientProfile(formData);
      setMessage(response.message);
      navigate("/patient/dashboard");
    } catch (error) {
      setMessage(error.message || "Error submitting profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 my-0.5">
            Patient Profile
          </h2>
          <p className="text-gray-500 font-bold">
            Fill in your details to complete your profile.
          </p>
        </div>

        {message && (
          <div className="bg-red-100 text-red-600 border border-red-400 rounded p-2 mb-4 text-sm text-center">
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <RiGenderlessLine className="text-gray-400 text-lg mr-2" />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full outline-none text-gray-700 bg-transparent">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600 px-3 font-bold block">
              Date of Birth
            </label>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaCalendarAlt className="text-gray-400 text-lg mr-2" />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaMapMarkerAlt className="text-gray-400 text-lg mr-2" />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <div className="flex items-start border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaUserMd className="text-gray-400 text-lg mr-2 mt-2" />
              <textarea
                name="medicalHistory"
                placeholder="Medical History (optional)"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full outline-none text-gray-700 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold shadow-md ${
              loading && "bg-emerald-300"
            }`}>
            {loading ? "Submitting..." : "Submit Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
