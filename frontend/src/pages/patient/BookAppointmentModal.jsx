import React from "react";
import { Modal, Form, Input, DatePicker, Button, Descriptions } from "antd";

const BookAppointmentModal = ({ visible, onCancel, doctor, onSubmit }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const payload = {
      doctor: doctor._id,
      date: values.date.toISOString(),
      reason: values.reason,
      startTime: values.startTime || null,
      endTime: values.endTime || null,
    };
    onSubmit(payload);
    form.resetFields();
  };

  return (
    <Modal
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      centered
      title={
        <h2 className="text-xl font-bold text-emerald-600">
          Book Appointment
        </h2>
      }
    >
      {doctor && (
        <div className="mb-4">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Doctor">
              {doctor.user?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Specialization">
              {doctor.specialization}
            </Descriptions.Item>
            <Descriptions.Item label="Consultation Fee">
              Rs.{doctor.consultationFee}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          label="Select Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            disabledDate={(current) => current && current < new Date()}
          />
        </Form.Item>

        <Form.Item label="Reason for Appointment" name="reason">
          <Input.TextArea rows={3} placeholder="Optional reason" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item label="Start Time" name="startTime" className="flex-1">
            <Input placeholder="e.g. 10:00 AM" />
          </Form.Item>
          <Form.Item label="End Time" name="endTime" className="flex-1">
            <Input placeholder="e.g. 11:00 AM" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-emerald-500 hover:bg-emerald-600 border-none w-full"
          >
            Confirm Booking
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookAppointmentModal;
