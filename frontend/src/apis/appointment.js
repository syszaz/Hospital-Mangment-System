import api from "./axios";

// docotor side
export const allAppointments = async (id, status = "all") => {
  try {
    const { data } = await api.get(
      `/appointment/appointments/all/${id}?status=${status}`
    );
    return data;
  } catch (error) {
    const banckendMesssage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching all appointments";

    throw new Error(banckendMesssage);
  }
};

export const approveAppointment = async (id) => {
  try {
    const { data } = await api.get(`/appointment/appointment/${id}/approve`);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error approving appointment";
    throw new Error(backendMessage);
  }
};

export const cancelAppointment = async (id) => {
  try {
    const { data } = await api.put(`/appointment/appointment/${id}/cancel`);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "error cancellling an appointment";
    throw new Error(backendMessage);
  }
};

export const completeAppointment = async (id) => {
  try {
    const { data } = await api.put(`/appointment/appointment/${id}/complete`);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "error completing an appointment";
    throw new Error(backendMessage);
  }
};

export const todayAppointments = async () => {
  try {
    const response = await api.get("/appointment/appointments/today");
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
    const response = await api.get("/appointment/appointments/coming-week");
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
    const response = await api.get("/appointment/today-revenue");
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
    const response = await api.get("/appointment/week-revenue");
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

export const getAllPatients = async () => {
  try {
    const { data } = await api.get(`/appointment/all-patients`);
    console.log(data);
    return data;
  } catch (error) {
    const banckendMesssage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching all patients";
    throw new Error(banckendMesssage);
  }
};

// patient side
export const patientAllAppointments = async (id, status = "all") => {
  try {
    const { data } = await api.get(
      `/appointment/all-appointments/${id}?status=${status}`
    );
    return data;
  } catch (error) {
    const banckendMesssage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching all patients";
    throw new Error(banckendMesssage);
  }
};

export const bookAppointment = async (id, payload) => {
  try {
    const { data } = await api.post(`/appointment/book/${id}`, payload);
    return data;
  } catch (error) {
    const banckendMesssage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching all patients";
    throw new Error(banckendMesssage);
  }
};
