import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  allAppointments,
  approveAppointment,
  cancelAppointment,
  completeAppointment,
} from "../../apis/appointment";
import { Tabs, Table, Button, Empty, Spin } from "antd";
import "@ant-design/v5-patch-for-react-19";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import { Search } from "lucide-react";

const DoctorAppointments = () => {
  const doctorProfile = useSelector((state) => state.doctorProfile.profile);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const approve = async (id) => {
    try {
      await approveAppointment(id);
      setAppointments((prev) =>
        prev
          .map((appt) =>
            appt._id === id ? { ...appt, status: "confirmed" } : appt
          )
          .filter((appt) =>
            statusFilter === "all" ? true : appt.status === statusFilter
          )
      );
    } catch (error) {
      setErrors(error.message || "Error approving appointment");
    }
  };

  const cancel = async (id) => {
    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev
          .map((appt) =>
            appt._id === id ? { ...appt, status: "cancelled" } : appt
          )
          .filter((appt) =>
            statusFilter === "all" ? true : appt.status === statusFilter
          )
      );
    } catch (error) {
      setErrors(error.message || "Error cancelling appointment");
    }
  };

  const complete = async (id) => {
    try {
      await completeAppointment(id);
      setAppointments((prev) =>
        prev
          .map((appt) =>
            appt._id === id ? { ...appt, status: "completed" } : appt
          )
          .filter((appt) =>
            statusFilter === "all" ? true : appt.status === statusFilter
          )
      );
    } catch (error) {
      setErrors(error.message || "Error completing appointment");
    }
  };

  const filteredAppointments = appointments.filter((appt) =>
    appt?.patient?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorProfile?._id) return;
      setLoading(true);
      try {
        const res = await allAppointments(doctorProfile._id, statusFilter);
        setAppointments(res.appointments || []);
      } catch (err) {
        setErrors(err.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorProfile, statusFilter]);

  const columns = [
    {
      title: "Patient",
      dataIndex: "patient",
      render: (p) => (
        <span className="font-medium text-gray-700">{p?.user?.name}</span>
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
          <span title="text">
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
          {record.status === "pending" && (
            <Button
              type="primary"
              className="bg-emerald-500 hover:bg-emerald-600 border-none"
              onClick={() => approve(record._id)}>
              Approve
            </Button>
          )}
          {(record.status === "pending" || record.status === "confirmed") && (
            <Button
              danger
              className="bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={() => cancel(record._id)}>
              Cancel
            </Button>
          )}
          <Button
            className="border-gray-300 hover:border-emerald-500 hover:text-emerald-600"
            onClick={() => {
              setSelectedAppointment(record);
              setDetailsVisible(true);
            }}>
            Details
          </Button>
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
      default:
        return "No appointments found";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Appointments</h1>
        <p className="opacity-90">
          Manage your patient appointments efficiently
        </p>
      </div>

      <div className="relative w-2/3 mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Patient Name"
          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white 
               shadow-sm placeholder-gray-400 text-gray-700 
               focus:outline-none focus:border-transparent 
               focus:ring-2 focus:ring-emerald-400 focus:shadow-lg
               transition-all duration-300 ease-in-out"
        />
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-100">
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
            loading={{
              spinning: loading,
              indicator: <Spin size="large" />,
            }}
            className="rounded-lg shadow-sm"
            pagination={{
              className: "mt-4",
            }}
            locale={{
              emptyText: <Empty description={getEmptyText()} />,
            }}
          />
        </div>

        <AppointmentDetailsModal
          visible={detailsVisible}
          onClose={() => setDetailsVisible(false)}
          appointment={selectedAppointment}
          onApprove={approve}
          onCancel={cancel}
          onComplete={complete}
        />

        {errors && (
          <p className="text-sm text-red-500 font-semibold mt-4">{errors}</p>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
