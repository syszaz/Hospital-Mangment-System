import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowLeft, Calendar } from "lucide-react";
import { getPatientByID } from "../../apis/patient";

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getPatientByID(id);
        setPatient(res.patient);
      } catch (err) {
        console.error("Error fetching patient details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-8 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {patient.name} ({calculateAge(patient.dateOfBirth)} yrs)
          </h1>
          <p className="opacity-90">Patient Details & Appointment History</p>
        </div>
        <Link
          to="/doctor/patients"
          className="flex items-center gap-2 text-sm bg-white text-emerald-600 px-3 py-2 rounded-lg shadow hover:bg-gray-100 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 text-gray-600">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {patient.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {patient.phone}
            </p>
            {patient.address && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {patient.address}
              </p>
            )}
          </div>
          <div className="text-gray-600 space-y-2">
            <p>Gender: <span className="font-medium">{patient.gender}</span></p>
            <p>
              DOB:{" "}
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString()
                : "N/A"}
            </p>
            <p>Total Visits: {patient.totalVisits || 0}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" /> Appointment History
        </h2>
        {patient.appointmentHistory?.length > 0 ? (
          <div className="space-y-4">
            {patient.appointmentHistory.map((appt, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">
                    {new Date(appt.date).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-xs capitalize px-3 py-1 rounded-full font-medium ${getStatusColor(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-1">{appt.reason}</p>
                <p className="text-xs text-gray-500">
                  {appt.startTime} - {appt.endTime}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No appointments yet</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;
