import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  deleteAppointment,
  patientAllAppointments,
  updateAppointment,
} from "../../apis/appointment";
import { Tabs, Table, Button, Empty, Spin, message, Popconfirm } from "antd";
import AppointmentDetailsModal from "../doctor/AppointmentDetailsModal";
import { Search } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";

const PatientAppointments = () => {
  const patientProfile = useSelector((state) => state.patientProfile.profile);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const fetchAppointments = async () => {
    if (!patientProfile?._id) return;
    setLoading(true);
    try {
      const res = await patientAllAppointments(
        patientProfile._id,
        statusFilter
      );
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientProfile, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredAppointments = appointments.filter((appt) => {
    const doctorName = appt?.doctor?.user?.name?.toLowerCase() || "";
    const reason = appt?.reason?.toLowerCase() || "";
    const search = debouncedSearch.toLowerCase();
    return doctorName.includes(search) || reason.includes(search);
  });

  const handleDelete = async (record) => {
    if (record.status !== "pending") {
      message.warning("Only pending appointments can be deleted");
      return;
    }
    try {
      await deleteAppointment(record._id);
      message.success("Appointment deleted successfully");
      fetchAppointments();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Error deleting appointment"
      );
    }
  };

  const columns = [
    {
      title: "Doctor",
      dataIndex: "doctor",
      render: (d) => (
        <span className="font-medium text-gray-700">{d?.user?.name}</span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      render: (text) => {
        if (!text) return "";
        const words = text.split(" ");
        const truncated = words.slice(0, 2).join(" ");
        return (
          <span title={text}>
            {truncated} {words.length > 2 ? " ..." : ""}
          </span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (d) => (
        <span className="text-gray-600">{new Date(d).toDateString()}</span>
      ),
    },
    {
      title: "Slot",
      render: (_, record) => (
        <span className="text-gray-600">
          {record.startTime} - {record.endTime}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => {
        const colors = {
          pending: "bg-orange-100 text-orange-700 border-orange-300",
          confirmed: "bg-green-100 text-green-700 border-green-300",
          cancelled: "bg-red-100 text-red-700 border-red-300",
          completed: "bg-blue-100 text-blue-700 border-blue-300",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[s]}`}>
            {s}
          </span>
        );
      },
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            className="border-gray-300 hover:border-emerald-500 hover:text-emerald-600"
            onClick={() => {
              setSelectedAppointment(record);
              setDetailsVisible(true);
            }}>
            Details
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                className="border-gray-300 hover:border-blue-500 hover:text-blue-600"
                onClick={() => {
                  setSelectedAppointment(record);
                  setShowRescheduleModal(true);
                }}>
                Reschedule
              </Button>
              <Popconfirm
                title="Are you sure to delete this appointment?"
                onConfirm={() => handleDelete(record)}
                okText="Yes"
                cancelText="No">
                <Button
                  danger
                  className="border-gray-300 hover:border-red-500 hover:text-red-600">
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  const getEmptyText = () => {
    switch (statusFilter) {
      case "pending":
        return "No pending appointments";
      case "confirmed":
        return "No confirmed appointments";
      case "cancelled":
        return "No cancelled appointments";
      case "completed":
        return "No completed appointments";
      default:
        return "No appointments found";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="opacity-90">View and track your scheduled appointments</p>
      </div>

      <div className="relative w-2/3 mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Doctor Name or Reason"
          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white 
               shadow-sm placeholder-gray-400 text-gray-700 
               focus:outline-none focus:border-transparent 
               focus:ring-2 focus:ring-emerald-400 focus:shadow-lg
               transition-all duration-300 ease-in-out"
        />
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
        <Tabs
          activeKey={statusFilter}
          onChange={setStatusFilter}
          items={[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "confirmed", label: "Confirmed" },
            { key: "cancelled", label: "Cancelled" },
            { key: "completed", label: "Completed" },
          ]}
        />

        <div className="overflow-x-auto mt-4">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filteredAppointments}
            loading={{ spinning: loading, indicator: <Spin size="large" /> }}
            className="rounded-lg shadow-sm"
            pagination={{ className: "mt-4" }}
            locale={{ emptyText: <Empty description={getEmptyText()} /> }}
          />
        </div>
      </div>

      <AppointmentDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        appointment={selectedAppointment}
        mode="patient"
      />

      <BookAppointmentModal
        visible={showRescheduleModal}
        onCancel={() => setShowRescheduleModal(false)}
        appointment={selectedAppointment}
        doctor={selectedAppointment?.doctor}
        mode="reschedule"
        onSubmit={async (payload, mode) => {
          try {
            if (mode === "reschedule") {
              console.log(payload);
              await updateAppointment(selectedAppointment._id, payload);
              message.success("Appointment rescheduled successfully");
            }
            setShowRescheduleModal(false);
            fetchAppointments();
          } catch (err) {
            message.error(
              err.response?.data?.message || "Error updating appointment"
            );
          }
        }}
      />
    </div>
  );
};

export default PatientAppointments;
