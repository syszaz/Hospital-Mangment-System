import api from "./axios";

export const createDoctorProfile = async (formData) => {
  try {
    const response = await api.post("/doctor/create-profile", formData);
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error creating doctor profile";

    throw new Error(backendMessage);
  }
};

export const todayAppointments = async () => {
  try {
    const response = await api.get("/doctor/appointments/today");
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching today's appointments";

    throw new Error(backendMessage);
  }
};

export const getComingWeekAppointments = async () => {
  try {
    const response = await api.get("/doctor/appointments/coming-week");
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching this week's appointments";

    throw new Error(backendMessage);
  }
};

export const todayREvenue = async () => {
  try {
    const response = await api.get("/doctor/today-revenue");
    console.log(response);
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching today's revenue";

    throw new Error(backendMessage);
  }
};

export const thisWeekRevenue = async () => {
  try {
    const response = await api.get("/doctor/week-revenue");
    console.log(response);
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching this week revenue";

    throw new Error(backendMessage);
  }
};

export const updateProfessionalInfo = async (id, professionalForm) => {
  try {
    const { data } = await api.put(`/doctor/profile/update/${id}`, professionalForm);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching today's revenue";
    throw new Error(backendMessage);
  }
};
