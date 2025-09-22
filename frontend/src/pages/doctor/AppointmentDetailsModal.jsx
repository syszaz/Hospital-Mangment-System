import React from "react";
import { Modal, Button, Descriptions } from "antd";

const AppointmentDetailsModal = ({
  visible,
  onClose,
  appointment,
  onApprove,
  onCancel,
  onComplete,
}) => {
  if (!appointment) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      title={
        <h2 className="text-xl font-bold text-emerald-600">
          Appointment Details
        </h2>
      }>
      <Descriptions
        bordered
        column={1}
        size="small"
        className="rounded-lg overflow-hidden"
        styles={{
          label: { fontWeight: 600, color: "#047857" },
        }}>
        <Descriptions.Item label="Patient">
          {appointment.patient?.user?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {appointment.patient?.user?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {appointment.patient?.user?.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Reason">
          {appointment.reason}
        </Descriptions.Item>
        <Descriptions.Item label="Booking Date Requested">
          {new Date(appointment.date).toDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Slot">
          {appointment.startTime} - {appointment.endTime}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              appointment.status === "pending"
                ? "bg-orange-100 text-orange-700"
                : appointment.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
            {appointment.status}
          </span>
        </Descriptions.Item>
      </Descriptions>

      <div className="flex justify-end gap-2 mt-6">
        {appointment.status === "pending" && (
          <Button
            type="primary"
            className="bg-emerald-500 hover:bg-emerald-600 border-none"
            onClick={() => {
              onApprove(appointment._id);
              onClose();
            }}>
            Approve
          </Button>
        )}
        {(appointment.status === "pending" ||
          appointment.status === "confirmed") && (
          <Button
            danger
            className="bg-red-500 hover:bg-red-600 text-white border-none"
            onClick={() => {
              onCancel(appointment._id);
              onClose();
            }}>
            Cancel
          </Button>
        )}
        {appointment.status === "confirmed" && (
          <Button
            type="default"
            className="bg-blue-500 hover:bg-blue-600 text-white border-none"
            onClick={() => {
              onComplete(appointment._id);
              onClose();
            }}>
            Complete
          </Button>
        )}
        {appointment.status === "cancelled" && (
          <Button
            type="primary"
            className="bg-emerald-500 hover:bg-emerald-600 border-none"
            onClick={() => {
              onApprove(appointment._id);
              onClose();
            }}>
            Re-Approve
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;
