import api from "./axios";

export const createPatientProfile = async (formData) => {
  try {
    const response = await api.post("/patient/create-profile", formData);
    return response.data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error creating patient profile";

    throw new Error(backendMessage);
  }
};

export const getPatientByID = async (id) => {
  try {
    const { data } = await api.get(`/patient/${id}`);
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error creating patient profile";
    throw new Error(backendMessage);
  }
};

export const updateProfessionalInfo = async (id, professionalForm) => {
  try {
    const { data } = await api.put(
      `/patient/update-profile/${id}`,
      professionalForm
    );
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error updating patient profile";
    throw new Error(backendMessage);
  }
};

export const nextAppointments = async () => {
  try {
    const { data } = await api.get("/patient/next-appointment");
    return data;
  } catch (error) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Error fetching upcoming appointments";
    throw new Error(backendMessage);
  }
};
