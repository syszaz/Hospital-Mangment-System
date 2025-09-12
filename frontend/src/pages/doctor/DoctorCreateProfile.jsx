import React, { useState, useEffect } from "react";
import { FaDollarSign, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { RiStethoscopeLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createDoctorProfile } from "../../apis/doctor";
import { getMe } from "../../apis/auth";
import { setUser } from "../../redux/slices/auth";

const DoctorCreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    consultationFee: "",
    clinicAddress: "",
    availability: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "doctor" && user.hasProfile) {
        navigate("/doctor/dashboard");
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
    if (!formData.specialization)
      newErrors.specialization = "Specialization is required";
    if (!formData.experience) newErrors.experience = "Experience is required";
    if (!formData.consultationFee)
      newErrors.consultationFee = "Consultation fee is required";
    if (!formData.clinicAddress)
      newErrors.clinicAddress = "Clinic address is required";
    if (!formData.availability)
      newErrors.availability = "Availability is required";
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
      const response = await createDoctorProfile(formData);
      const freshUser = await getMe();
      dispatch(setUser(freshUser));
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 my-0.5">
            Doctor Profile
          </h2>
          <p className="text-gray-500 font-bold">
            Fill in your details to complete your profile.
          </p>
        </div>

        {message && (
          <div
            className={`${
              message.toLowerCase().includes("error")
                ? "bg-red-100 text-red-700 border-red-400"
                : "bg-green-100 text-green-700 border-green-400"
            } border rounded p-2 mb-4 text-sm text-center`}>
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-gray-600 px-3 font-bold block">
              {" "}
              Specialization{" "}
            </label>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <RiStethoscopeLine className="text-gray-400 text-lg mr-2" />
              <input
                type="text"
                name="specialization"
                placeholder="Specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>
          {errors.specialization && (
            <p className="text-red-500 text-sm">{errors.specialization}</p>
          )}

          <div>
            <label className="text-gray-600 px-3 font-bold block">
              {" "}
              Experience (years){" "}
            </label>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaCalendarAlt className="text-gray-400 text-lg mr-2" />
              <input
                type="number"
                name="experience"
                placeholder="Experience (years)"
                value={formData.experience}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>
          {errors.experience && (
            <p className="text-red-500 text-sm">{errors.experience}</p>
          )}

          <div>
            <label className="text-gray-600 px-3 font-bold block">
              {" "}
              Consultation Fee (Rs.){" "}
            </label>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaDollarSign className="text-gray-400 text-lg mr-2" />
              <input
                type="number"
                name="consultationFee"
                placeholder="Consultation Fee"
                value={formData.consultationFee}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>
          {errors.consultationFee && (
            <p className="text-red-500 text-sm">{errors.consultationFee}</p>
          )}

          <div>
            <label className="text-gray-600 px-3 font-bold block">
              {" "}
              Clinic Address{" "}
            </label>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaMapMarkerAlt className="text-gray-400 text-lg mr-2" />
              <input
                type="text"
                name="clinicAddress"
                placeholder="Clinic Address"
                value={formData.clinicAddress}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>
          {errors.clinicAddress && (
            <p className="text-red-500 text-sm">{errors.clinicAddress}</p>
          )}

          <div>
            <label className="text-gray-600 px-3 font-bold block">
              {" "}
              Availability{" "}
            </label>
            <div className="flex items-center border-b-2 border-emerald-400 focus-within:border-emerald-500 px-3 py-2">
              <FaCalendarAlt className="text-gray-400 text-lg mr-2" />
              <input
                type="text"
                name="availability"
                placeholder="Availability (e.g., Mon-Fri 10am-4pm)"
                value={formData.availability}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>
          {errors.availability && (
            <p className="text-red-500 text-sm">{errors.availability}</p>
          )}

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

export default DoctorCreateProfile;
