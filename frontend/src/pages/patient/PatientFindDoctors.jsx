import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Spin, Empty, message } from "antd";
import { listAllDoctors } from "../../apis/doctor";
import { Search } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";
import { bookAppointment } from "../../apis/appointment";

const PatientFindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [doctorToBook, setDoctorToBook] = useState(null);

  const fetchAllDoctors = async () => {
    try {
      setLoading(true);
      const response = await listAllDoctors();
      setDoctors(response?.doctors || []);
    } catch (error) {
      message.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name?.toLowerCase() || "";
    const specialization = doc.specialization?.toLowerCase() || "";
    const clinicAddress = doc.clinicAddress?.toLowerCase() || "";
    const fee = doc.consultationFee || 0;
    const feeQuery = Number(debouncedSearch);
    const isFeeSearch = !isNaN(feeQuery);
    return (
      name.includes(debouncedSearch.toLowerCase()) ||
      specialization.includes(debouncedSearch.toLowerCase()) ||
      clinicAddress.includes(debouncedSearch.toLowerCase()) ||
      (isFeeSearch && fee <= feeQuery)
    );
  });

  const handleBookAppointment = async ({ doctorId, ...rest }) => {
    try {
      await bookAppointment(doctorId, rest);
      message.success("Appointment booked successfully");
      setBookingModalVisible(false);
    } catch (error) {
      message.error(error.message || "Failed to book appointment");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: ["user", "name"],
      key: "name",
      render: (name) => (
        <span className="font-medium text-gray-700">{name}</span>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      render: (exp) => `${exp} years`,
    },
    {
      title: "Consultation Fee",
      dataIndex: "consultationFee",
      key: "consultationFee",
      render: (fee) => `Rs.${fee}`,
    },
    {
      title: "Clinic",
      dataIndex: "clinicAddress",
      key: "clinicAddress",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            className="border-gray-300 hover:border-emerald-500 hover:text-emerald-600"
            onClick={() => {
              setSelectedDoctor(record);
              setModalVisible(true);
            }}>
            View Details
          </Button>
          <Button
            type="primary"
            className="bg-emerald-500 hover:bg-emerald-600 border-none"
            onClick={() => {
              setDoctorToBook(record);
              setBookingModalVisible(true);
            }}>
            Book Now
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="opacity-90">Browse and book appointments with doctors</p>
      </div>

      <div className="relative w-2/3 mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name, specialization, address or fee"
          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white 
                 shadow-sm placeholder-gray-400 text-gray-700 
                 focus:outline-none focus:border-transparent 
                 focus:ring-2 focus:ring-emerald-400 focus:shadow-lg
                 transition-all duration-300 ease-in-out"
        />
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
        <div className="overflow-x-auto mt-4">
          <Table
            dataSource={filteredDoctors}
            columns={columns}
            rowKey="_id"
            loading={{ spinning: loading, indicator: <Spin size="large" /> }}
            className="rounded-lg shadow-sm"
            pagination={{ className: "mt-4" }}
            locale={{ emptyText: <Empty description="No doctors found" /> }}
          />
        </div>
      </div>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
        title={
          <h2 className="text-xl font-bold text-emerald-600">Doctor Profile</h2>
        }>
        {selectedDoctor && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Name">
              {selectedDoctor.user?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedDoctor.user?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedDoctor.user?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Specialization">
              {selectedDoctor.specialization}
            </Descriptions.Item>
            <Descriptions.Item label="Experience">
              {selectedDoctor.experience} years
            </Descriptions.Item>
            <Descriptions.Item label="Consultation Fee">
              Rs.{selectedDoctor.consultationFee}
            </Descriptions.Item>
            <Descriptions.Item label="Clinic Address">
              {selectedDoctor.clinicAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Days Off">
              {selectedDoctor.daysOff?.join(", ") || "None"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <BookAppointmentModal
        visible={bookingModalVisible}
        doctor={doctorToBook}
        onCancel={() => setBookingModalVisible(false)}
        onSubmit={(data) => {
          handleBookAppointment(data);
          setBookingModalVisible(false);
        }}
      />
    </div>
  );
};

export default PatientFindDoctors;
