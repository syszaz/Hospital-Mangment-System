import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfileByEmail, updatePersonalInfo } from "../../apis/user";
import { updateProfessionalInfo } from "../../apis/patient";
import { logout } from "../../redux/slices/auth";
import { setPatientProfile } from "../../redux/slices/patientProfile";

const PatientProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const patientProfile = useSelector((state) => state.patientProfile.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    gender: "",
    dateOfBirth: "",
    address: "",
    medicalHistory: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.email) {
          const profileData = await fetchUserProfileByEmail(user.email);
          setProfile(profileData.user);

          if (profileData.patientProfile) {
            dispatch(setPatientProfile(profileData.patientProfile));
            setPatientForm({
              gender: profileData.patientProfile.gender || "",
              dateOfBirth: profileData.patientProfile.dateOfBirth
                ? profileData.patientProfile.dateOfBirth.split("T")[0]
                : "",
              address: profileData.patientProfile.address || "",
              medicalHistory: (
                profileData.patientProfile.medicalHistory || []
              ).join(", "),
            });
          }
        }
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/signin");
  };

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
    setPersonalForm({ ...personalForm, [e.target.name]: e.target.value });
  };

  const handleSavePersonal = async () => {
    try {
      const updated = await updatePersonalInfo(profile._id, personalForm);
      setProfile(updated.user);
      setIsEditingPersonal(false);
    } catch (err) {
      setError(err.message || "Failed to update personal profile info");
    }
  };

  const editingPatientInfo = () => {
    if (patientProfile) {
      setPatientForm({
        gender: patientProfile.gender || "",
        dateOfBirth: patientProfile.dateOfBirth
          ? patientProfile.dateOfBirth.split("T")[0]
          : "",
        address: patientProfile.address || "",
        medicalHistory: patientProfile.medicalHistory || [],
      });
    }
    setIsEditingPatient(true);
  };

  const handlePatientChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const handleSavePatient = async () => {
    try {
      const updated = await updateProfessionalInfo(profile._id, {
        ...patientForm,
        medicalHistory: patientForm.medicalHistory
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
      });

      setProfile(updated.user);
      dispatch(setPatientProfile(updated.patient));

      setPatientForm({
        gender: updated.patient.gender || "",
        dateOfBirth: updated.patient.dateOfBirth
          ? updated.patient.dateOfBirth.split("T")[0]
          : "",
        address: updated.patient.address || "",
        medicalHistory: (updated.patient.medicalHistory || []).join(", "),
      });

      setIsEditingPatient(false);
    } catch (err) {
      setError(err.message || "Failed to update patient profile info");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-emerald-600">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg mr-3"></div>
              Patient Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your personal and medical details
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
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Personal Information
                  </h2>
                  <p>
                    <strong>Name:</strong> {profile.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile.phone}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile.role}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border-l-4 border-emerald-500 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Edit Personal Information
                  </h2>
                  <input
                    type="text"
                    name="name"
                    value={personalForm.name}
                    onChange={handlePersonalChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={personalForm.email}
                    onChange={handlePersonalChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={personalForm.phone}
                    onChange={handlePersonalChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    name="role"
                    value={personalForm.role}
                    readOnly
                    className="w-full mb-4 px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handleSavePersonal}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingPersonal(false)}
                      className="bg-gray-200 px-4 py-2 rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!isEditingPatient ? (
                <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Patient Information
                  </h2>
                  <p>
                    <strong>Gender:</strong> {patientProfile?.gender}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {patientProfile?.dateOfBirth
                      ? new Date(
                          patientProfile.dateOfBirth
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {patientProfile?.address}
                  </p>
                  <p>
                    <strong>Medical History:</strong>{" "}
                    {patientProfile?.medicalHistory?.length > 0
                      ? patientProfile.medicalHistory.join(", ")
                      : "None"}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Edit Patient Information
                  </h2>
                  <select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={patientForm.dateOfBirth}
                    onChange={handlePatientChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    name="address"
                    value={patientForm.address}
                    onChange={handlePatientChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg"
                    placeholder="Address"
                  />
                  <textarea
                    name="medicalHistory"
                    value={patientForm.medicalHistory}
                    onChange={handlePatientChange}
                    className="w-full mb-4 px-3 py-2 border rounded-lg"
                    placeholder="Enter medical history (comma separated)"
                  />

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handleSavePatient}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingPatient(false)}
                      className="bg-gray-200 px-4 py-2 rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {profile.name}
                </h3>
                <p className="text-gray-600 mb-4">{patientProfile?.gender}</p>
                <p className="text-sm text-gray-500">
                  Member Since{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Profile Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => editingPersonalInfo()}
                    className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md">
                    Edit Personal Info
                  </button>
                  <button
                    onClick={() => editingPatientInfo()}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">
                    Edit Patient Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No profile found</p>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
