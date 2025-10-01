import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Activity, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { fullList } from '../../apis/admin';


const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fullList();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const appointments = data?.stats?.appointmentStats || {};
  const doctors = data?.doctors || [];
  const patients = data?.patients || [];
  const allAppointments = data?.appointments || [];

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats.totalDoctors || 0,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingDoctors || 0,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients || 0,
      icon: UserCheck,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments || 0,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const appointmentCards = [
    {
      title: 'Pending',
      value: appointments.pending || 0,
      icon: Clock,
      color: 'border-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Confirmed',
      value: appointments.confirmed || 0,
      icon: CheckCircle,
      color: 'border-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Completed',
      value: appointments.completed || 0,
      icon: Activity,
      color: 'border-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Cancelled',
      value: appointments.cancelled || 0,
      icon: XCircle,
      color: 'border-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const activeDoctors = (stats.totalDoctors || 0) - (stats.pendingDoctors || 0);

  const completionRate = stats.totalAppointments
    ? Math.round((appointments.completed / stats.totalAppointments) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-white text-black bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <p className="text-sm opacity-90 mb-1">Today</p>
                  <p className="font-semibold text-lg">{today}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Appointment Overview</h2>
            </div>
            <span className="text-sm text-gray-500">
              Total: {stats.totalAppointments || 0}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {appointmentCards.map((card, index) => (
              <div
                key={index}
                className={`border-2 ${card.color} rounded-xl p-5 hover:scale-105 transition-transform duration-300`}>
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={`w-8 h-8 ${card.textColor}`} />
                  <span className={`text-4xl font-bold ${card.textColor}`}>
                    {card.value}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">{card.title}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.totalAppointments
                    ? `${Math.round((card.value / stats.totalAppointments) * 100)}%`
                    : '0%'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Doctors</h3>
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-emerald-600">
                  {activeDoctors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-amber-600">
                  {stats.pendingDoctors || 0}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                  style={{
                    width: `${stats.totalDoctors ? (activeDoctors / stats.totalDoctors) * 100 : 0}%`,
                  }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.totalDoctors
                  ? `${Math.round((activeDoctors / stats.totalDoctors) * 100)}% Approved`
                  : 'No data'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Patients</h3>
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Registered</span>
                <span className="font-semibold text-blue-600">
                  {stats.totalPatients || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">With Appointments</span>
                <span className="font-semibold text-purple-600">
                  {new Set(allAppointments.map(a => a.patient?._id)).size}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-full transition-all duration-500"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Active patient base
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Performance</h3>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-purple-600">
                  {completionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Today</span>
                <span className="font-semibold text-emerald-600">
                  {appointments.confirmed || 0}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                  style={{
                    width: `${completionRate}%`,
                  }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Overall appointment success
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Doctors</h3>
              <span className="text-sm text-gray-500">{doctors.length} total</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {doctors.slice(0, 5).map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">
                        {doctor.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{doctor.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{doctor.specialization || 'General'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doctor.status === 'approved' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {doctor.status}
                  </span>
                </div>
              ))}
              {doctors.length === 0 && (
                <p className="text-center text-gray-500 py-8">No doctors found</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Patients</h3>
              <span className="text-sm text-gray-500">{patients.length} total</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {patients.slice(0, 5).map((patient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {patient.user?.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{patient.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{patient.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <p className="text-center text-gray-500 py-8">No patients found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;