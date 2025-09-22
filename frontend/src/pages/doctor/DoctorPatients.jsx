import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { getAllPatients } from "../../apis/appointment";
import { Link } from "react-router-dom";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getAllPatients();
        setPatients(res.patients);
      } catch (err) {
        console.error("Error fetching patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);
      const matchesGender =
        !genderFilter ||
        patient.gender?.toLowerCase() === genderFilter.toLowerCase();
      return matchesSearch && matchesGender;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "lastAppointment" || sortBy === "dateOfBirth") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [patients, searchTerm, genderFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage);
  const currentPatients = filteredAndSortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Patients</h1>
          <p className="opacity-90">Manage and track all your patients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {patients.length}
                </p>
              </div>
              <div className="bg-emerald-100 rounded-full p-3">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Visits
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {patients.reduce((sum, p) => sum + (p.totalVisits || 0), 0)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="w-full lg:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="totalVisits-desc">Most Visits</option>
                <option value="totalVisits-asc">Least Visits</option>
                <option value="lastAppointment-desc">Recent Appointment</option>
                <option value="lastAppointment-asc">Oldest Appointment</option>
              </select>
            </div>
          </div>
        </div>

        {currentPatients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {currentPatients.map((patient) => (
              <Link
                to={`/doctor/patients/${patient._id}`}
                key={patient._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 rounded-full p-2">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {patient.gender} •{" "}
                          {patient.dateOfBirth
                            ? `${calculateAge(patient.dateOfBirth)} years old`
                            : "Age N/A"}
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {patient.totalVisits} visits
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600">Last Appointment:</span>
                    <span className="font-medium text-gray-900">
                      {patient.lastAppointment
                        ? new Date(patient.lastAppointment).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedPatients.length
                )}{" "}
                of {filteredAndSortedPatients.length} patients
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === i + 1
                        ? "bg-emerald-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}>
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  classNamea="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
