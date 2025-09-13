import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfileByEmail, updatePersonalInfo } from "../../apis/user";
import { logout } from "../../redux/slices/auth";
import { updateProfessionalInfo } from "../../apis/doctor";

const DoctorProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [professionalForm, setProfessionalForm] = useState({
    specialization: "",
    experience: "",
    consultationFee: "",
    clinicAddress: "",
    daysOff: [],
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const editingPersonalInfo = () => {
    setPersonalForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
    });
    setIsEditingPersonal(true);
  };

  const handlePersonalChange = (e) => {
    setPersonalForm({
      ...personalForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSavePersonal = async () => {
    try {
      const updated = await updatePersonalInfo(profile._id, personalForm);
      setProfile(updated.user);
      setIsEditingPersonal(false);
    } catch (err) {
      setError(err.message || "failed to update personal profile info");
    }
  };

  const editingProfessionalInfo = () => {
    setProfessionalForm({
      specialization: doctorProfile.specialization,
      experience: doctorProfile.experience,
      consultationFee: doctorProfile.consultationFee,
      clinicAddress: doctorProfile.clinicAddress,
      daysOff: doctorProfile.daysOff || [],
    });
    setIsEditingProfessional(true);
  };

  const handleProfessionalChange = (e) => {
    setProfessionalForm({
      ...professionalForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleDaysOffChange = (day) => {
    const newDaysOff = professionalForm.daysOff.includes(day)
      ? professionalForm.daysOff.filter((d) => d !== day)
      : [...professionalForm.daysOff, day];

    setProfessionalForm({ ...professionalForm, daysOff: newDaysOff });
  };

  const handleSaveProfessional = async () => {
    try {
      const updated = await updateProfessionalInfo(
        doctorProfile._id,
        professionalForm
      );
      setDoctorProfile(updated.doctor);
      setIsEditingProfessional(false);
    } catch (err) {
      setError(err.message || "failed to update professional profile info");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.email) {
          const profileData = await fetchUserProfileByEmail(user.email);
          setProfile(profileData.user);
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

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

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
            Loading your profile...
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
                Error Loading Profile
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg mr-3"></div>
              Doctor Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your professional information and settings
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Logout
          </button>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {!isEditingPersonal ? (
                <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="w-6 h-6 bg-emerald-500 rounded mr-3"></div>
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold text-gray-800">
                        {profile.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Email Address
                      </label>
                      <p className="text-lg text-gray-700">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-lg text-gray-700">{profile.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Role
                      </label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 capitalize">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="w-6 h-6 bg-emerald-500 rounded mr-3"></div>
                    Edit Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={personalForm.name}
                        onChange={handlePersonalChange}
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={personalForm.email}
                        onChange={handlePersonalChange}
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={personalForm.phone}
                        onChange={handlePersonalChange}
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={personalForm.role}
                        readOnly
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handleSavePersonal}
                      className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer text-white px-4 py-2 rounded-lg font-medium transition">
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingPersonal(false)}
                      className="bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-800 px-4 py-2 rounded-lg font-medium transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div>
                {!isEditingProfessional ? (
                  <div>
                    {doctorProfile && (
                      <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <div className="w-6 h-6 bg-blue-500 rounded mr-3"></div>
                          Professional Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Specialization
                            </label>
                            <p className="text-lg font-semibold text-gray-800">
                              {doctorProfile.specialization}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Experience
                            </label>
                            <p className="text-lg text-gray-700">
                              {doctorProfile.experience} years
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Consultation Fee
                            </label>
                            <p className="text-lg font-semibold text-emerald-600">
                              Rs{" "}
                              {doctorProfile.consultationFee?.toLocaleString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Status
                            </label>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                doctorProfile.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : doctorProfile.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {doctorProfile.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Clinic Address
                          </label>
                          <p className="text-lg text-gray-700 mt-1">
                            {doctorProfile.clinicAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      Edit Professional Info
                    </h2>

                    {/* Specialization */}
                    <input
                      type="text"
                      name="specialization"
                      value={professionalForm.specialization}
                      onChange={handleProfessionalChange}
                      className="w-full mb-4 px-3 py-2 border rounded-lg"
                      placeholder="Specialization"
                    />

                    {/* Experience */}
                    <input
                      type="number"
                      name="experience"
                      value={professionalForm.experience}
                      onChange={handleProfessionalChange}
                      className="w-full mb-4 px-3 py-2 border rounded-lg"
                      placeholder="Experience in years"
                    />

                    {/* Consultation Fee */}
                    <input
                      type="number"
                      name="consultationFee"
                      value={professionalForm.consultationFee}
                      onChange={handleProfessionalChange}
                      className="w-full mb-4 px-3 py-2 border rounded-lg"
                      placeholder="Consultation Fee"
                    />

                    {/* Clinic Address */}
                    <textarea
                      name="clinicAddress"
                      value={professionalForm.clinicAddress}
                      onChange={handleProfessionalChange}
                      className="w-full mb-4 px-3 py-2 border rounded-lg"
                      placeholder="Clinic Address"
                    />

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Days Off</h4>
                      {[
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ].map((day) => (
                        <label
                          key={day}
                          className="inline-flex items-center mr-3">
                          <input
                            type="checkbox"
                            checked={professionalForm.daysOff.includes(day)}
                            onChange={() => handleDaysOffChange(day)}
                            className="mr-2"
                          />
                          {day}
                        </label>
                      ))}
                    </div>

                    <div className="flex space-x-4 mt-6">
                      <button
                        onClick={handleSaveProfessional}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingProfessional(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Dr. {profile.name}
                </h3>
                {doctorProfile && (
                  <>
                    <p className="text-gray-600 mb-4">
                      {doctorProfile.specialization}
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-emerald-600">
                          {doctorProfile.experience}
                        </p>
                        <p className="text-gray-500">Years Exp.</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-emerald-600">
                          Rs {doctorProfile.consultationFee}
                        </p>
                        <p className="text-gray-500">Fee</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Account Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profile Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctorProfile?.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {doctorProfile?.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      Doctor
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-700">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <button
                    onClick={() => editingPersonalInfo()}
                    className="px-3 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white rounded-md">
                    Edit Personal Info
                  </button>
                  <button
                    onClick={() => editingProfessionalInfo()}
                    className="px-3 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white rounded-md">
                    Edit Professional Info
                  </button>
                </div>
              </div>

              {doctorProfile?.daysOff && doctorProfile.daysOff.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Days Off
                  </h3>
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
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Profile Found
            </h3>
            <p className="text-gray-600">
              Unable to load your profile information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;