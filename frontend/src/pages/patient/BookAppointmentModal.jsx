import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Descriptions,
  Radio,
  message,
} from "antd";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
dayjs.extend(weekday);
dayjs.extend(localeData);

const BookAppointmentModal = ({ visible, onCancel, doctor, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleFinish = (values) => {
    if (!doctor?._id) {
      message.error("Doctor profile not found");
      return;
    }

    const payload = {
      doctorId: doctor._id,
      date: values.date.format("YYYY-MM-DD"),
      reason: values.reason,
      slotId: values.slotId,
    };

    onSubmit(payload);

    form.resetFields();
    setSelectedDate(null);
  };

  return (
    <Modal
      open={visible}
      onCancel={() => {
        form.resetFields();
        setSelectedDate(null);
        onCancel();
      }}
      footer={null}
      centered
      title={
        <h2 className="text-xl font-bold text-emerald-600">Book Appointment</h2>
      }>
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
          rules={[{ required: true, message: "Please select a date" }]}>
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              return current && current.isBefore(dayjs().startOf("day"), "day");
            }}
            onChange={(date) => {
              setSelectedDate(date);

              if (!date) return;
              const weekday = date.format("dddd");

              if (doctor?.daysOff?.includes(weekday)) {
                Modal.error({
                  title: "Doctor is Unavailable",
                  content: `Doctor is off on ${weekday}. Please choose another date.`,
                });
              }
            }}
          />
        </Form.Item>

        {selectedDate && (
          <Form.Item
            name="slotId"
            label={`Available Slots for ${selectedDate.format("dddd")}`}
            rules={[{ required: true, message: "Please select a slot" }]}>
            <Radio.Group>
              {doctor?.availability
                ?.filter((slot) => slot.day === selectedDate.format("dddd"))
                .map((slot) => (
                  <Radio key={slot._id} value={slot._id}>
                    {slot.startTime} - {slot.endTime} ({slot.day})
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item label="Reason for Appointment" name="reason">
          <Input.TextArea rows={3} placeholder="Optional reason" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-emerald-500 hover:bg-emerald-600 border-none w-full">
            Confirm Booking
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookAppointmentModal;
