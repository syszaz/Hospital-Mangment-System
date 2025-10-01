import React, { useState, useEffect } from "react";
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

const BookAppointmentModal = ({
  visible,
  onCancel,
  doctor,
  appointment,
  mode = "book",
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (mode === "reschedule" && appointment) {
      const date = dayjs(appointment.date);
      setSelectedDate(date);
      form.setFieldsValue({
        date,
        reason: appointment.reason,
        slotId: appointment.slotId || appointment.slot?._id,
      });
    }
  }, [mode, appointment, form]);

  const handleFinish = (values) => {
    if (mode === "book" && !doctor?._id) {
      message.error("Doctor profile not found");
      return;
    }

    const payload = {
      reason: values.reason,
      slotId: values.slotId,
    };

    if (mode === "book") {
      payload.date = values.date.format("YYYY-MM-DD");
      payload.doctorId = doctor._id;
    }

    if (mode === "reschedule") {
      payload.newDate = values.date.format("YYYY-MM-DD");
    }

    try {
      onSubmit(payload, mode);
      form.resetFields();
      setSelectedDate(null);
    } catch (error) {
      console.log("error occured")
    }
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
        <h2 className="text-xl font-bold text-emerald-600">
          {mode === "book" ? "Book Appointment" : "Reschedule Appointment"}
        </h2>
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
            disabledDate={(current) =>
              current && current.isBefore(dayjs().startOf("day"), "day")
            }
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
            {mode === "book" ? "Confirm Booking" : "Confirm Reschedule"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookAppointmentModal;
