import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { allAppointments } from "../../apis/doctor";
import { Tabs, Table, Button, message, Empty } from "antd";
import "@ant-design/v5-patch-for-react-19";

const DoctorAppointments = () => {
  const doctorProfile = useSelector((state) => state.doctorProfile.profile);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

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
      render: (p) => `${p.name}`,
    },
    { title: "Reason", dataIndex: "reason" },
    {
      title: "Date",
      dataIndex: "date",
      render: (d) => new Date(d).toDateString(),
    },
    {
      title: "Slot",
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    { title: "Status", dataIndex: "status" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          {record.status === "pending" && (
            <Button type="primary">Approve</Button>
          )}
          <Button danger>Cancel</Button>
          <Button onClick={() => console.log("Details", record)}>
            Details
          </Button>
        </>
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
    <div className="p-4">
      <Tabs
        activeKey={statusFilter}
        onChange={setStatusFilter}
        items={[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "confirmed", label: "Confirmed" },
          { key: "cancelled", label: "Cancelled" },
        ]}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={appointments}
        loading={loading}
        locale={{
          emptyText: <Empty description={getEmptyText()} />,
        }}
      />

      {errors && message.error(errors)}
    </div>
  );
};

export default DoctorAppointments;
